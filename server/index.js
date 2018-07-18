/* eslint-disable no-console */

const express = require('express');
const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const fileUpload = require('express-fileupload');
const rimraf = require('rimraf');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const bodyParser = require('body-parser');
const _ = require('lodash');

const app = express();
const port = 8000;

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});

app.use(bodyParser.json());
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

app.post('/pdf', (req, res) => {
    console.log('Generating PDF.');
    const doc = new PDFDocument();
    let x = 20;
    let y = 20;
    let row = 0;

    const output = req.body;
    const stats = processStats(output);

    doc.text(`Nodeflux License Plate Validation Report`, x, y);
    y += 40;

    let j = 0;
    for (let key in stats) {
        if (stats.hasOwnProperty(key)) {
            const value = stats[key];

            if (j % 2 === 0 && j !== 0) {
                y += 40;
                x = 20;
            }

            doc.text(`${camelToSentence(key)}: `, x, y);
            x += 140;
            doc.text(`${value}`, x, y);
            x += 200;
            j++;
        }
    }

    console.log('Adding page');
    doc.addPage({
        margin: 15,
    });

    x = 20;
    y = 20;

    for (let item of output) {
        x = 0;
        // console.log('Processing row ', row);

        // Add new page if row exceeding 20
        if (row > 20) {
            doc.addPage({
                margin: 15,
            });
            row = 0;
            x = 0;
            y = 50;
        }

        // Iterate to get column of each row
        for (let key in item) {
            if (item.hasOwnProperty(key)) {
                x += 20;

                // Set license plate image
                if (key === 'image') {
                    doc.image(`public${item[key]}`, x, y);
                    x += 60;
                } else {
                    // Set license plate content
                    doc.text(`${key}: `, x, y);
                    x += 60;
                    doc.text(`${item[key]}`, x, y);
                    x += 80;
                }
            }
        }

        row++;
        y += 30;
    }

    const pdfFilePath = 'public/download.pdf';

    // console.log('Writing PDF.');

    doc.pipe(fs.createWriteStream(pdfFilePath));
    doc.end();

    // console.log('PDF created.');
    res.status(200).send('READY');
});

const processStats = (data) => {
    const validated = data
        .map((item) => (item.validation === 'true' ? 1 : 0))
        .reduce((accumulator, currentValue) => accumulator + currentValue);

    const blur = data
        .map((item) => (item.blur === 'true' ? 1 : 0))
        .reduce((accumulator, currentValue) => accumulator + currentValue);

    const validatedBlur = data
        .map(
            (item) =>
                item.validation === 'true' && item.blur === 'true' ? 1 : 0
        )
        .reduce((accumulator, currentValue) => accumulator + currentValue);

    const validatedNotBlur = data
        .map(
            (item) =>
                item.validation === 'true' && item.blur === 'false' ? 1 : 0
        )
        .reduce((accumulator, currentValue) => accumulator + currentValue);

    const notValidatedBlur = data
        .map(
            (item) =>
                item.validation === 'false' && item.blur === 'true' ? 1 : 0
        )
        .reduce((accumulator, currentValue) => accumulator + currentValue);

    const notValidatedNotBlur = data
        .map(
            (item) =>
                item.validation === 'false' && item.blur === 'false' ? 1 : 0
        )
        .reduce((accumulator, currentValue) => accumulator + currentValue);

    const accuracy = `${Math.round((validated * 100) / data.length, 3)}%`;

    const stats = {
        content: data.length,
        accuracy,
        validated,
        blur,
        validatedBlur,
        validatedNotBlur,
        notValidatedBlur,
        notValidatedNotBlur,
    };

    return stats;
};

const camelToSentence = (text) => {
    let result = text.replace(/([A-Z])/g, ' $1');
    let finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
};
