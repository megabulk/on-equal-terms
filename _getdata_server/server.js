var express = require('express'), spawn = require('child_process').spawn, push = require('git-push');

var router = express.Router();

// Initialize http server
const app = express();

// Use v1 as prefix for all API endpoints
app.use('/v1', router);

//need to call `npm run getdata` or `babel-node getdata.js`

// respond with "hello world" when a GET request is made to the homepage
// http://localhost:3001/v1/
router.get('/', function (req, res) {
	res.send('hello world');
	console.log('hello');
	var child = spawn('npm', ['run', 'getdata']);

	child.stdout.on('data', (data) => {
	  console.log(`stdout: ${data}`);
	});

	child.stderr.on('data', (data) => {
	  console.log(`stderr: ${data}`);
	});

	child.on('close', (code) => {
	  console.log(`child process exited with code ${code}`);
	});
});

// Launch the server on port 3001
const server = app.listen(3001, () => {
	const { address, port } = server.address();
	console.log(`Listening at http://${address}:${port}`);
});