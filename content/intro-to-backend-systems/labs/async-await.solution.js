function fetchUserData() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: 1, name: 'Alice' }), 100);
  });
}

async function getUser() {
  const user = await fetchUserData();
  return user.name;
}

getUser().then((name) => console.log(name));
