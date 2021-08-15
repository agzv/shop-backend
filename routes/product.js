const express = require('express');
const router = express.Router();

const productController = require('../controllers/product');

router.get('/', productController.getProducts);

router.get('/:productId', productController.getProduct);

router.patch('/:productId', productController.editProduct);

router.post('/create-product', productController.createProduct);

router.delete('/:productId', productController.deleteProduct);

module.exports = router;