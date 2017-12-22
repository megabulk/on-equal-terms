//all from https://sprintworks.se/blog/data-from-google-drive-in-static-websites/

import GoogleSpreadsheet from "google-spreadsheet";
import async from "async";
import fs from "fs";

const doc = new GoogleSpreadsheet(
	// Using our example spreadsheet: https://docs.google.com/spreadsheets/d/1o_NWrDsVNSVU1jViexKQi08aI6h76fXrMIcvbT9faoM/edit#gid=0
  "1HxG9g5OrTc7JVwMw5c2Xm23GRo3s3EKU0HTthkvXN-U"
);
let sheet;


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
  sheet.getRows(
    {
      offset: 1,
      limit: 20,
      orderby: "col1"
    }, function(err, rows) {
      console.log("Read " + rows.length + " rows");
      // Clean posts.yml
      fs.truncate("./_data/posts.yml", 0, () => {
      });
      // Save rows as items in the YAML file
      for (let row of rows) {
        fs.appendFile(
          "./_data/posts.yml",
          "- date: " +
          row.title +
          "\n\x20\x20" +
          "title: " +
          row.data +
          "\n\n",
          err => {
          }
        );
      }
    }
  );
}
]);
