const express = require("express");
const fs = require("fs");
const extract = require("extract-zip");
const fileUpload = require("express-fileupload");

const app = express();
const port = 8000;

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});

app.use(fileUpload());

app.post("/upload", (req, res) => {
    if (!req.files) return res.status(400).send("No files were uploaded.");

    let plateFile = req.files.plateFile;
    const filePath = __dirname + "../public/plate.zip";
    const target = __dirname + ".../public/plate";

    plateFile.mv(filePath, function(err) {
        if (err) return res.status(500).send(err);
        console.log(`File ${filePath} uploaded.`);

        extract(filePath, { dir: target }, function(err) {
            if (err) {
                res.status(500).send("Error on extracting file.");
            } else {
                res.status(200).send(`File ${filePath} extracted`);
            }
        });
    });
});
