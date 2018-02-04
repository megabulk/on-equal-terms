var express = require('express'), spawn = require('child_process').spawn;

var router = express.Router();

// Initialize http server
const app = express();

// Use v1 as prefix for all API endpoints
app.use('/v1', router);

//need to call `npm run getdata` or `babel-node getdata.js`

//https://stackoverflow.com/questions/38288639/how-to-use-npm-scripts-within-javascript
/*
var child = spawn('./node_modules/.bin/webpack-dev-server', [
    '--progress',
    '--colors',
    '<YOUR ENTRY FILE>'
]);
*/

/*
var child = spawn('./node_modules/babel-cli/bin/babel-node', [
	'./getdata.js'
]);
*/

/*
child.stdout.on('data', function (data) {
    process.stdout.write(data);
});

child.stderr.on('data', function (data) {
    process.stdout.write(data);
});

child.on('exit', function (data) {
    process.stdout.write('I\'m done!');
});
*/

// respond with "hello world" when a GET request is made to the homepage
// http://localhost:3001/v1/
router.get('/', function (req, res) {
  res.send('hello world');
  var child = spawn('npm', ['run', 'getdata']);
});

// Launch the server on port 3001
const server = app.listen(3001, () => {
	const { address, port } = server.address();
	console.log(`Listening at http://${address}:${port}`);
});