const express = require("express");
const fs = require("fs");
const path = require("path");
const extract = require("extract-zip");
const fileUpload = require("express-fileupload");
const rimraf = require("rimraf");

const app = express();
const port = 8000;

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});

app.use(fileUpload());

app.post("/upload", (req, res) => {
    if (!req.files) return res.status(400).send("No files were uploaded.");

    let plateFile = req.files.plateFile;
    const filePath = path.join(__dirname, "..", "public", "plate.zip");
    const target = path.join(__dirname, "..", "public", "plate");

    rimraf(target, () => {
        console.log(`Folder ${target} removed`);
        plateFile.mv(filePath, err => {
            if (err) return res.status(500).send(err);
            console.log(`File ${filePath} uploaded.`);

            extract(filePath, { dir: target }, err => {
                if (err) {
                    res.status(500).send("Error on extracting file.");
                } else {
                    let files = [];

                    fs.readdirSync(target).forEach(file => {
                        files.push(file);
                    });

                    let output = [];

                    files = files.map(file => {
                        const filename = file.split(".")[0];

                        const imageExtension = ["jpg", "jpeg", "png", "gif"];
                        const fileExtension = file.split(".")[1];

                        if (imageExtension.includes(fileExtension)) {
                            output.push({
                                image: file,
                                content: filename,
                                validation: "false",
                                blur: "false"
                            });
                        }
                    });

                    res.status(200).send(JSON.stringify({ data: output }));
                }
            });
        });
    });
});
