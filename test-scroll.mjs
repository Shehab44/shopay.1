
async function run() {
  const start = Date.now();
  // Simulate an infinite scroll network request using standard Next.js Server Action POST
  // We dont have the exact action ID, but we can test SSR pagination speed
  const res = await fetch("http://localhost:3000/category/all?page=2");
  await res.text();
  const time = Date.now() - start;
  console.log(`Page 2 loaded in ${time}ms`);
}
run();

