# Vue Code Review Guide

## Composition API Patterns

### setup Script — MEDIUM

Use `<script setup>` for simpler syntax and better tree-shaking. Avoid mixing Options API and Composition API.

```vue
<!-- GOOD -->
<script setup lang="ts">
import { ref, computed } from "vue";
import { useUser } from "@/composables/useUser";

const { user, loading } = useUser();
const greeting = computed(() => `Hello, ${user.value?.name ?? "Guest"}`);
</script>

<!-- BAD — mixing APIs -->
<script lang="ts">
export default {
  setup() {
    const user = ref(null);
    return { user };
  },
  computed: {
    greeting() {
      return `Hello, ${this.user?.name}`; // Options API uses `this`
    },
  },
};
</script>
```

### ref vs reactive — MEDIUM

Use `ref` for primitives and reactive objects that may be reassigned. Use `reactive` for grouped state that won't be reassigned.

```vue
<script setup lang="ts">
// GOOD — ref for primitives
const count = ref(0);
const name = ref("Alice");

// GOOD — reactive for grouped state
const state = reactive({
  page: 1,
  filters: { search: "", sort: "date" },
});

// BAD — reactive for primitives (reassignment breaks reactivity)
const state = reactive({
  count: 0, // works but ref is simpler
});
</script>
```

### Computed Caching — LOW

Computed properties are cached. Use them over methods for expensive computations.

```vue
<script setup lang="ts">
// GOOD — cached
const sortedItems = computed(() => [...items.value].sort(byDate));

// BAD — recomputed every render
const sortedItems = () => [...items.value].sort(byDate);
</script>
```

---

## Reactivity System

### Missing `toRef` / `toRefs` — MEDIUM

When destructuring reactive objects, use `toRefs` to preserve reactivity.

```vue
<script setup lang="ts">
const state = reactive({ count: 0, name: "Alice" });

// BAD — loses reactivity
const { count, name } = state;

// GOOD — preserves reactivity
const { count, name } = toRefs(state);
</script>
```

### watch Cleanup — MEDIUM

Always clean up watchers and side effects.

```vue
<script setup lang="ts">
// GOOD — cleanup
watchEffect((onCleanup) => {
  const handler = () => {};
  window.addEventListener("resize", handler);
  onCleanup(() => window.removeEventListener("resize", handler));
});

// BAD — no cleanup, listener leaks
watchEffect(() => {
  window.addEventListener("resize", () => {});
});
</script>
```

---

## Component Design

### Props Typing — MEDIUM

Always type props with `defineProps<T>()` in `<script setup>`.

```vue
<!-- GOOD -->
<script setup lang="ts">
interface Props {
  userId: string;
  editable?: boolean;
  onUpdate?: (name: string) => void;
}
const props = defineProps<Props>();
</script>

<!-- BAD — untyped props -->
<script setup lang="ts">
const props = defineProps(["userId", "editable"]);
</script>
```

### Emits Typing — MEDIUM

Type emitted events with `defineEmits<T>()`.

```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: "update", id: string, value: string): void;
  (e: "delete", id: string): void;
}>();
</script>
```

### Slots Typing — LOW

Type slot props for better IDE support.

---

## Pinia State Management

### Store Design — MEDIUM

Keep stores focused. One store per domain. Avoid god stores.

```typescript
// GOOD — focused stores
const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  async function login(email: string, password: string) { ... }
  return { user, token, login };
});

// BAD — everything in one store
const useAppStore = defineStore("app", () => {
  const user = ref(null);
  const posts = ref([]);
  const theme = ref("light");
  const notifications = ref([]);
  // ... 20 more things
});
```

### Store Outside Components — HIGH

Never access stores outside components or setup functions. Use composables to provide access.

---

## Common Mistakes

### Wrong Ref Access in Template — MEDIUM

In templates, refs are auto-unwrapped. Don't use `.value`.

```vue
<template>
  <!-- GOOD -->
  <p>{{ user.name }}</p>

  <!-- BAD — .value in template -->
  <p>{{ user.value.name }}</p>
</template>
```

### Missing `v-for` Key — MEDIUM

Always provide a unique `:key` in `v-for`.

```vue
<!-- GOOD -->
<li v-for="item in items" :key="item.id">{{ item.name }}</li>

<!-- BAD -->
<li v-for="item in items">{{ item.name }}</li>
```

### Async Component Without Suspense — LOW

Wrap async components in `<Suspense>` or handle loading state explicitly.

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Mixing Options + Composition API | MEDIUM | Use `<script setup>` only |
| Missing watch cleanup | MEDIUM | Use `onCleanup` callback |
| Destructuring reactive without toRefs | MEDIUM | Use `toRefs()` |
| Untyped props | MEDIUM | Use `defineProps<T>()` |
| God store | MEDIUM | Split into focused stores |
| .value in template | MEDIUM | Remove .value |
| Missing v-for key | MEDIUM | Add unique `:key` |
| Store outside component | HIGH | Use composables for access |
