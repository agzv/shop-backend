const express = require('express');
const router = express.Router();

const productController = require('../controllers/product');
const isAuth = require('../middlewares/isAuth');

router.get('/', productController.getProducts);

router.get('/:productId', productController.getProduct);

router.patch('/:productId', isAuth, productController.editProduct);

router.post('/create-product', isAuth, productController.createProduct);

router.delete('/:productId', isAuth, productController.deleteProduct);

module.exports = router;