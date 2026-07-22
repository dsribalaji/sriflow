# N+1 Query Prevention Guide

Language-agnostic review checklist. Apply to every PR with ORM data fetching.

---

## The Problem

1 query fetches N records. Then N additional queries fetch associations for each record. Total: 1 + N queries.

```
SELECT * FROM posts;                        -- 1 query
SELECT * FROM comments WHERE post_id = 1;   -- query 2
SELECT * FROM comments WHERE post_id = 2;   -- query 3
SELECT * FROM comments WHERE post_id = 3;   -- query 4
...
SELECT * FROM comments WHERE post_id = N;   -- query N+1
```

For 1000 posts: 1001 queries instead of 2.

---

## Performance Impact

| Approach | Queries (N=1000) | Load Time | Notes |
|----------|-----------------|-----------|-------|
| N+1 (lazy loading) | 1001 | ~5000ms | Default ORM behavior |
| Eager Loading (JOIN) | 1 | ~50ms | 1 big query with JOIN |
| Batch Fetching (IN) | 2 | ~80ms | 1 for parents, 1 with IN clause |
| DataLoader | 2-3 | ~90ms | Batches across resolvers |

**Rule: if N > 10, it's an N+1 problem. Fix it.**

---

## Detection

### ORM SQL Logging

Enable query logging in development. Watch for repeated similar queries.

**Python (SQLAlchemy)**
```python
import logging
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
```

**Python (Django)**
```python
# settings.py
LOGGING = {
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {"django.db.backends": {"level": "DEBUG"}},
}
```

**Node.js (Prisma)**
```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
generator client {
  provider = "prisma-client-js"
}
// Enable query logging
const prisma = new PrismaClient({ log: ["query"] });
```

**Go (GORM)**
```go
db.Logger = logger.Default.LogMode(logger.Info)
```

### Query Count Assertions

```python
# Django test
def test_posts_with_comments():
    with self.assertNumQueries(2):  # 1 for posts, 1 for comments
        posts = Post.objects.prefetch_related("comments").all()
        for post in posts:
            _ = post.comments.all()
```

### APM Tools

Datadog, New Relic, Sentry Performance — all flag N+1 patterns in traces.

---

## Solution 1: Eager Loading (JOIN)

Fetches everything in one query using JOIN. Best for simple relationships.

**Python (SQLAlchemy)**
```python
# VULNERABLE - lazy loading
posts = session.query(Post).all()
for post in posts:
    print(post.comments)  # N+1

# SAFE - joinedload (single JOIN query)
from sqlalchemy.orm import joinedload
posts = session.query(Post).options(joinedload(Post.comments)).all()
```

**Python (Django)**
```python
# VULNERABLE
posts = Post.objects.all()
for post in posts:
    print(post.comments.all())  # N+1

# SAFE - select_related (JOIN, for ForeignKey/OneToOne)
posts = Post.objects.select_related("author").all()

# SAFE - prefetch_related (separate query, for ManyToMany/reverse FK)
posts = Post.objects.prefetch_related("comments").all()
```

**Java (JPA / Hibernate)**
```java
// VULNERABLE
List<Post> posts = em.createQuery("SELECT p FROM Post p", Post.class).getResultList();
posts.forEach(p -> p.getComments().size()); // N+1

// SAFE - JOIN FETCH
List<Post> posts = em.createQuery(
    "SELECT p FROM Post p JOIN FETCH p.comments", Post.class
).getResultList();

// SAFE - @EntityGraph
@EntityGraph(attributePaths = {"comments"})
List<Post> findAll();
```

**C# (EF Core)**
```csharp
// VULNERABLE
var posts = context.Posts.ToList();
foreach (var post in posts)
    Console.WriteLine(post.Comments.Count); // N+1

// SAFE - Include
var posts = context.Posts
    .Include(p => p.Comments)
    .ThenInclude(c => c.Author)  // nested
    .ToList();
```

**Laravel (Eloquent)**
```php
// VULNERABLE
$posts = Post::all();
foreach ($posts as $post) {
    echo $post->comments->count(); // N+1
}

// SAFE - with()
$posts = Post::with('comments')->get();
```

**Node.js (Prisma)**
```javascript
// VULNERABLE
const posts = await prisma.post.findMany();
for (const post of posts) {
    const comments = await prisma.comment.findMany({
        where: { postId: post.id }
    }); // N+1
}

// SAFE - include
const posts = await prisma.post.findMany({
    include: { comments: true }
});
```

### JOIN Caveats

JOINs can cause duplicate rows (cartesian product) with multiple collections.

```sql
-- Problem: 10 posts x 5 comments each = 50 rows (10 posts repeated)
SELECT p.*, c.* FROM posts p JOIN comments c ON c.post_id = p.id;

-- Solution: two separate queries instead of one JOIN
-- Query 1: posts (10 rows)
-- Query 2: comments WHERE post_id IN (1,2,3,...,10) (50 rows, no duplication)
```

For multiple collections, prefer **batch fetching** over JOIN.

---

## Solution 2: Batch Fetching (IN Clause)

Two queries: one for parents, one for children using `IN` clause.

**Python (SQLAlchemy)**
```python
from sqlalchemy.orm import selectinload

posts = session.query(Post).options(selectinload(Post.comments)).all()
# Query 1: SELECT * FROM posts
# Query 2: SELECT * FROM comments WHERE post_id IN (1, 2, 3, ...)
```

**Python (Django)**
```python
# prefetch_related uses IN clause under the hood
posts = Post.objects.prefetch_related("comments").all()
```

**C# (EF Core)**
```csharp
// Split queries avoid cartesian product
var posts = context.Posts
    .Include(p => p.Comments)
    .AsSplitQuery()  // separate IN queries instead of JOIN
    .ToList();
```

---

## Solution 3: DataLoader Pattern

Batches and caches requests within a single execution unit. Essential for GraphQL.

```javascript
// Node.js - DataLoader
import DataLoader from "dataloader";

const commentLoader = new DataLoader(async (postIds) => {
    const comments = await prisma.comment.findMany({
        where: { postId: { in: postIds } }
    });
    // Return in same order as postIds
    return postIds.map(id => comments.filter(c => c.postId === id));
});

// Usage in resolver
const resolvers = {
    Post: {
        comments: (post) => commentLoader.load(post.id)
    }
};
```

Even if 100 posts are resolved, DataLoader batches all `.load()` calls into 1 query.

**Python (aiodataloader / promise)**
```python
from promise import Promise
from dataloader import DataLoader

class CommentLoader(DataLoader):
    def batch_load_fn(self, post_ids):
        comments = Comment.objects.filter(post_id__in=post_ids)
        grouped = {pid: [] for pid in post_ids}
        for c in comments:
            grouped[c.post_id].append(c)
        return Promise.resolve([grouped[pid] for pid in post_ids])
```

---

## Solution 4: Projection

Fetch only the fields you need. Reduces data transfer and can avoid associations entirely.

```python
# Instead of loading full Comment objects, select specific columns
from sqlalchemy import select

stmt = select(Post.id, Post.title, func.count(Comment.id).label("comment_count"))
stmt = stmt.outerjoin(Comment, Comment.post_id == Post.id)
stmt = stmt.group_by(Post.id, Post.title)

results = session.execute(stmt).all()
# One query, no N+1, no association loading
```

**Django**
```python
posts = Post.objects.annotate(comment_count=Count("comments")).values("id", "title", "comment_count")
```

**Prisma**
```javascript
const posts = await prisma.post.findMany({
    select: {
        id: true,
        title: true,
        _count: { select: { comments: true } }
    }
});
```

---

## Review Checklist

- [ ] No lazy loading in production code paths (watch for `for` loops triggering associations)
- [ ] Eager loading used for all association access patterns
- [ ] SQL logging enabled in dev/test — no repeated similar queries
- [ ] Query count assertions in integration tests
- [ ] Multiple collections: split query or DataLoader, not cartesian JOIN
- [ ] GraphQL resolvers use DataLoader for association batching
- [ ] APM traces reviewed for N+1 patterns before deploy
- [ ] Consider projection when full objects aren't needed
