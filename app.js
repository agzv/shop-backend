const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./routes/product');
const authRoutes = require('./routes/auth');

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
app.use('/auth', authRoutes);

// ERROR HANDLING
// app.use((err, req, res, next) => {
//     console.log(err);
//     const status = err.statusCode || 500;
//     const message = err.message;
//     res.status(status).json({ message: message });
// });

mongoose.connect('mongodb+srv://anvar05:barbos91@cluster0.peapc.mongodb.net/shop?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(3100);
    })
    .catch(err => console.log(err));
