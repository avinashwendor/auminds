function createExpressRouteHandler() {
  return (req, res) => ({
    status: 200,
    message: 'Welcome to Node.js Backend API!',
  });
}

const handler = createExpressRouteHandler();
console.log(JSON.stringify(handler({}, {})));
