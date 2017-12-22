//https://sprintworks.se/blog/data-from-google-drive-in-static-websites/
import GoogleSpreadsheet from "google-spreadsheet";
import async from "async";
import fs from "fs";

//https://developers.google.com/drive/v3/web/quickstart/nodejs
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

const doc = new GoogleSpreadsheet(
	// Using our example spreadsheet: https://docs.google.com/spreadsheets/d/1o_NWrDsVNSVU1jViexKQi08aI6h76fXrMIcvbT9faoM/edit#gid=0
	"1HxG9g5OrTc7JVwMw5c2Xm23GRo3s3EKU0HTthkvXN-U"
);
let sheet;

let projects = [];


async.series([function setAuth(step) {
	const creds = require("./on equal terms-fb6d7d521f80.json");
	doc.useServiceAccountAuth(creds, step);
}, function getInfoAndWorksheets(step) {
	doc.getInfo((err, info) => {
		console.log(
			"Loaded spreadsheet: " + info.title + " by " + info.author.email
		);
		// Using the first sheet
		sheet = info.worksheets[0];
		console.log(
			"sheet 1: " + sheet.title + " " + sheet.rowCount + "x" + sheet.colCount
		);
		step();
	});
}, function getStuff(step) {
	sheet.getRows({
		offset: 1,
		limit: 200,
		orderby: "col1"
	}, function(err, rows) {
		console.log("Read " + rows.length + " rows");
		// Clean posts.yml
		fs.truncate("./_data/posts.yml", 0, () => {});
		projects = rows;
		step();
	});
}, function loadClientSecrets(step) {
	console.log('loadClientSecrets');
	// Load client secrets from a local file.
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		}
		// Authorize a client with the loaded credentials, then call the
		// Drive API.
		authorize(JSON.parse(content), listFiles);
	});
}
]);

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
		process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var auth = new googleAuth();
	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, function(err, token) {
		if (err) {
			getNewToken(oauth2Client, callback);
		} else {
			oauth2Client.credentials = JSON.parse(token);
			callback(oauth2Client);
		}
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *		 client.
 */
function getNewToken(oauth2Client, callback) {
	var authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES
	});
	console.log('Authorize this app by visiting this url: ', authUrl);
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question('Enter the code from that page here: ', function(code) {
		rl.close();
		oauth2Client.getToken(code, function(err, token) {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				return;
			}
			oauth2Client.credentials = token;
			storeToken(token);
			callback(oauth2Client);
		});
	});
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
	try {
		fs.mkdirSync(TOKEN_DIR);
	} catch (err) {
		if (err.code != 'EEXIST') {
			throw err;
		}
	}
	fs.writeFile(TOKEN_PATH, JSON.stringify(token));
	console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
	var service = google.drive('v3');
	
	//get OET Images folder (maybe this is unecessary, if ID never changes)
	service.files.list({
	q: "mimeType='application/vnd.google-apps.folder' and name = 'OET Images'",
	auth: auth,
	pageSize: 10,
	fields: "nextPageToken, files(name, id)"
	}, function(err, response) {
	if (err) {
		console.log('The API returned an error: ' + err);
		return;
	}
	var files = response.files;
	if (files.length == 0) {
		console.log('No files found.');
	} else {
		//https://developers.google.com/drive/v3/web/search-parameters
		//OET Images (1Iu6jWgIxjThhM7GtANdacYcSVXRANCbL)
		//image/jpeg
		//application/vnd.google-apps.folder
		//Bathroom Shack (1ysl_sw5iMdgyLPmoMKHR53PYDh1vIgC1)
		var mainFolderID = files[0].id;
		console.log(mainFolderID);

		console.log('get project folders');
		//get project folders
		for (let project of projects) {
			console.log('Seeking images in folder ' + project.title);
			service.files.list({
				q: "mimeType='application/vnd.google-apps.folder' and '" + mainFolderID + "' in parents and name = '" + project.title + "'",
				auth: auth,
				pageSize: 10,
				fields: "nextPageToken, files(name, id)"
			}, function(err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
				var files = response.files;
				if (files.length == 0) {
					console.log('No files found in ' + project.title);
				} else {
					console.log('Project Folder: ' + project.title);
					for (var i = 0; i < files.length; i++) {
						var file = files[i];
						console.log(file);
			
						//get images
			
						service.files.list({
							q: "mimeType='image/jpeg' and '" + file.id + "' in parents",
							auth: auth,
							pageSize: 100,
							fields: "nextPageToken, files(id, name, mimeType, parents, properties, description)"
						}, function(err, response) {
							if (err) {
								console.log('The API returned an error: ' + err);
								return;
							}
							var files = response.files;
							if (files.length == 0) {
								console.log('No files found.');
							} else {
								//https://developers.google.com/drive/v3/web/search-parameters
								//OET Images (1Iu6jWgIxjThhM7GtANdacYcSVXRANCbL)
								//image/jpeg
								//application/vnd.google-apps.folder
								//Bathroom Shack (1ysl_sw5iMdgyLPmoMKHR53PYDh1vIgC1)
								console.log('Files: ' + project.title);

								fs.appendFile(
									"./_data/posts.yml",
									"- title: " +
									project.title +
									"\n\x20\x20" +
									"data: " +
									project.data +
									"\n\x20\x20" +
									"images: "
									,
									err => {}
								);

								for (var i = 0; i < files.length; i++) {
									var file = files[i];
									console.log(file);
									fs.appendFile(
										"./_data/posts.yml",
										"\n\x20\x20\x20\x20" +
										"- id: " +
										file.id +
										"\n\x20\x20\x20\x20\x20\x20" +
										"description: " +
										file.description +
										"\n",
										err => {}
									);

								}
							}
						});
					}
				}
			}
			);
		}


	}
	});

	
}
