// Lab: Async/Await & Promise Handling
// ────────────────────────────────────
// 1. Complete `fetchUserData` so it returns a Promise resolving to { id: 1, name: "Alice" } after 100ms
// 2. Complete `getUser` to await the data and return the user's name
// 3. Run and verify output: "Alice"

function fetchUserData() {
  return new Promise((resolve) => {
    // TODO: resolve user after 100ms
  });
}

async function getUser() {
  // TODO: await fetchUserData and return user.name
}

getUser().then((name) => console.log(name));
