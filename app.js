const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");
const pdfMake = require('./pdfmake/pdfmake');
const vfsFonts = require('./pdfmake/vfs_fonts');

pdfMake.vfs = vfsFonts.pdfMake.vfs;

const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: true});

app.use(urlencodedParser);

const pool = mysql.createPool({
    connectionLimit: 5,
    host: "localhost",
    user: "root",
    database: "tz",
    password: "Pa$$w0rd"
});

app.get('/', (req, res) => {
    res.sendfile('index.html');
});

app.post('/pdf', async function (req, res) {

        let firstName = req.body.firstName;
        let isSuccess = false;
        let user;
        let pdfDoc;
        pool.query(`SELECT * FROM user WHERE firstName ='${firstName}' limit 1;`, function (err, result) {
            if (err) {
                console.log(err);
            } else if (result.length === 0) {
                res.status(404);
                res.json({"error": "Not found"});
            } else {
                user = result[0];
                let documentDefinition = {
                    content: [
                        `Hello ${user.firstName} ${user.lastName}`,
                        'Nice to meet you!'
                    ]
                }
                pdfDoc = new Buffer.from(pdfMake.createPdf(documentDefinition).toString());
                console.log(pdfDoc);
                console.log('------------------------------------------');
                pool.query(`UPDATE user SET pdf = 1, image = 1 WHERE firstName = '${user.firstName}';`, function (err, result) {
                    if (err) {
                        console.log(err);
                        isSuccess = false;
                        res.json({'isSuccess': isSuccess});
                    } else {

                        isSuccess = true;
                        console.log(user.firstName);
                        console.log(user.lastName);

                        res.json({'isSuccess': true});
                    }
                })
            }
        });
    }
);

app.listen(3000, function () {
    console.log("Сервер ожидает подключения...")
});