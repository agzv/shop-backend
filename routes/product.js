const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const productController = require('../controllers/product');
const isAuth = require('../middlewares/isAuth');
const isAdminAuth = require('../middlewares/isAdminAuth');


router.post('/add-to-cart', isAuth, productController.addToCart);

router.get('/cart', isAuth, productController.getCart);

router.post('/cart-delete-item', isAuth, productController.removeFromCart);

router.post('/cart-clear', isAuth, productController.clearCart);

router.get('/orders', isAuth, productController.getOrders);

router.post('/create-order', isAuth, productController.createOrder);

router.get('/', productController.getProducts);

router.get('/:productId', productController.getProduct);

router.patch('/:productId', [
    body('title', 'Please enter a title, min 3 characters').trim().not().isEmpty().isLength({ min: 3 }),
    body('description', 'Please enter a description, min 5 characters').trim().not().isEmpty().isLength({ min: 5 }),
    body('price', 'Please enter a price, should be a number').trim().not().isEmpty().isNumeric(),
    body('category', 'Please enter a category').trim().not().isEmpty()
], isAdminAuth, productController.editProduct);

router.post('/create-product', [
    body('title', 'Please enter a title, min 3 characters').trim().not().isEmpty().isLength({ min: 3 }),
    body('description', 'Please enter a description, min 5 characters').trim().not().isEmpty().isLength({ min: 5 }),
    body('price', 'Please enter a price, should be a number').trim().not().isEmpty().isNumeric(),
    body('category', 'Please enter a category').trim().not().isEmpty()
], isAdminAuth, productController.createProduct);

router.delete('/:productId', isAdminAuth, productController.deleteProduct);


module.exports = router;