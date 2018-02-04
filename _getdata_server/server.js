var express = require('express'), spawn = require('child_process').spawn;

var router = express.Router();

// Initialize http server
const app = express();

// Use v1 as prefix for all API endpoints
app.use('/v1', router);

// respond with "hello world" when a GET request is made to the homepage
// http://localhost:3001/v1/
router.get('/', function (req, res) {
  res.send('hello world')
});

// Launch the server on port 3001
const server = app.listen(3001, () => {
	const { address, port } = server.address();
	console.log(`Listening at http://${address}:${port}`);
});