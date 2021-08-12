const express = require('express');
const router = express.Router();

const productController = require('../controllers/product');

router.get('/', productController.getProducts);

router.post('/create-product', productController.createProduct);

module.exports = router;