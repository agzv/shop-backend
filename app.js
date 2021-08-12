const express = require('express');
const bodyParser = require('body-parser');

const productRoutes = require('./routes/product');

const app = express();

app.use(bodyParser.json());

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/products', productRoutes);

app.listen(3100);