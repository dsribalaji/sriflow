import { getDb } from './db';

async function testDb() {
  const db = await getDb();
  
  // Test insert and read
  await db.run("INSERT OR IGNORE INTO categories (id, name) VALUES ('c1', 'Test Category')");
  const cat = await db.get("SELECT * FROM categories WHERE id = 'c1'");
  
  console.assert(cat.name === 'Test Category', `expected 'Test Category', got ${cat.name}`);
  console.log('ok');
}

testDb().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
