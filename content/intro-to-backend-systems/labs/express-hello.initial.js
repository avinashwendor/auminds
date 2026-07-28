// Lab: Express Route Handler
// ───────────────────────────
// Write a route handler for GET '/' that returns status 200
// and message "Welcome to Node.js Backend API!"

function createExpressRouteHandler() {
  return (req, res) => {
    // TODO: return the welcome response object
  };
}

const handler = createExpressRouteHandler();
console.log(JSON.stringify(handler({}, {})));
