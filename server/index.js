/* eslint-disable no-console */

const express = require('express');
const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const fileUpload = require('express-fileupload');
const rimraf = require('rimraf');
const cors = require('cors');
const PDFDocument = require('pdfkit');

const app = express();
const port = 8000;

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});

app.use(fileUpload());

const filePath = path.join(__dirname, '..', 'public', 'plate.zip');
const target = path.join(__dirname, '..', 'public', 'plate');

const production = false;
if (!production) app.use(cors());

const getPlateFiles = () => {
    let files = [];

    fs.readdirSync(target).forEach((file) => {
        files.push(file);
    });

    let output = [];

    files = files.map((file) => {
        const filename = file.split('.')[0];

        const imageExtension = ['jpg', 'jpeg', 'png', 'gif'];
        const fileExtension = file.split('.')[1];

        if (imageExtension.includes(fileExtension)) {
            output.push({
                image: `/plate/${file}`,
                content: filename,
                validation: 'false',
                blur: 'false',
            });
        }
    });

    return output;
};

app.post('/upload', (req, res) => {
    if (!req.files) return res.status(400).send('No files were uploaded.');

    let plateFile = req.files.plateFile;

    rimraf(target, () => {
        console.log(`Folder ${target} removed`);
        plateFile.mv(filePath, (err) => {
            if (err) return res.status(500).send(err);
            console.log(`File ${filePath} uploaded.`);

            extract(filePath, {dir: target}, (err) => {
                if (err) {
                    res.status(500).send('Error on extracting file.');
                } else {
                    const output = getPlateFiles();

                    res.status(200).send(JSON.stringify({data: output}));
                }
            });
        });
    });
});

app.get('/pdf', (req, res) => {
    const doc = new PDFDocument();
    let y = 0;

    const output = getPlateFiles();

    for (let item of output) {
        let x = 0;

        for (let key in item) {
            if (item.hasOwnProperty(key)) {
                x += 20;
                if (key === 'image') {
                    doc.image(`public${item[key]}`, x, y);
                    x += 60;
                } else {
                    doc.text(key, x, y);
                    x += 60;
                    doc.text(item[key], x, y);
                    x += 60;
                }
            }
        }
        y += 20;
    }

    const pdfFilePath = 'public/download.pdf';

    doc.pipe(fs.createWriteStream(pdfFilePath));
    doc.end();
    res.status(200).send('READY');
});
