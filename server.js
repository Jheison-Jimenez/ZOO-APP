const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.BUCKET_NAME;

app.post('/add-product', (req, res) => {
    const { productId, productName } = req.body;
    const params = {
        Bucket: BUCKET_NAME,
        Key: `products/${productId}.json`,
        Body: JSON.stringify({ productId, productName }),
        ContentType: 'application/json'
    };

    s3.putObject(params, (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send({ message: 'Product added successfully', data });
    });
});

app.get('/get-product/:productId', (req, res) => {
    const { productId } = req.params;
    const params = {
        Bucket: BUCKET_NAME,
        Key: `products/${productId}.json`
    };

    s3.getObject(params, (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(JSON.parse(data.Body.toString()));
    });
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
