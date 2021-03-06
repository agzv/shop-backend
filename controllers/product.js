const { validationResult } = require('express-validator');

const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const fileHelper = require('../utilities/file');

exports.getProducts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 3;
    let totalItems;

    Product.find().countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find().skip((currentPage - 1) * perPage).limit(perPage)
        })
        .then(products => {
            res.status(200).json({ message: 'Products fetched successfully', products: products, totalItems: totalItems });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;

    Product.findById(productId)
        .then(product => {
            res.status(200).json({ message: 'Product fetched successfully', product: product });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.editProduct = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Error occured');
        error.data = errors.array();
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.file) {
        const error = new Error('Error occured');
        error.data = [{ param: 'image', msg: 'Please provide an image' }];
        error.statusCode = 422;
        throw error;
    }

    const productId = req.params.productId;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const imageUrl = req.file.path;

    Product.findById(productId)
        .then(product => {
            product.title = title;
            product.description = description;
            product.price = price;
            if(imageUrl) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = imageUrl;
            }
            return product.save();
        })
        .then(() => {
            res.status(200).json('Product updated successfully');
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.createProduct = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Error occured');
        error.data = errors.array();
        error.statusCode = 422;
        throw error;
    }
    
    if(!req.file) {
        const error = new Error('Error occured');
        error.data = [{ param: 'image', msg: 'Please provide an image' }];
        error.statusCode = 422;
        throw error;
    }
    
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const imageUrl = req.file.path;
    const category = req.body.category;
    const creator = req.userId;
    
    const product = new Product({ title, description, price, imageUrl, category, creator });
    product.save()
        .then(() => {
            res.status(201).json({ message: 'Product was created' })
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId;

    Product.findById(productId)
        .then(product => {
            if(!product) {
                const error = new Error('Error occured');
                error.data = [{ param: 'Delete', msg: 'Product not found' }];
                throw error;
            }

            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: productId, creator: req.userId });
        })
        .then(() => {
            res.status(200).json({ message: 'Product was deleted sucessfully' });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.addToCart = (req, res, next) => {
    const productId = req.body.productId;
    let fetchedProduct;
    Product.findById(productId)
        .then(product => {
            fetchedProduct = product;
            return User.findById(req.userId);
        })
        .then(user => {
            return user.addToCart(fetchedProduct);
        })
        .then(() => {
            res.json({ message: 'Product was successfully added to your cart' });
        })
};

exports.getCart = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            if(!user) {
                const error = new Error('Error occured');
                error.data = [{param: 'auth', msg: 'User not found'}];
                throw error;
            }
            return user.populate('cart.items.productId').execPopulate()
        })
        .then(user => {
            const products = user.cart.items;
            res.json({ cartProducts: products });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};

exports.removeFromCart = (req, res, next) => {
    const productId = req.body.productId;

    User.findById(req.userId)
        .then(user => {
            user.removeFromCart(productId);
        })
        .then(() => {
            res.json({ message: 'Product was successfully removed from a cart' });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};

exports.clearCart = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            user.clearCart();
        })
        .then(() => {
            res.json({ message: 'Your cart was emptied' });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.createOrder = (req, res, next) => {
    let loadedUser;
    User.findById(req.userId)
        .then(user => {
            return user.populate('cart.items.productId').execPopulate()
        })
        .then(user => {
            loadedUser = user;
            const products = user.cart.items.map(item => {
                return { quantity: item.quantity, product: { ...item.productId._doc } };
            });

            const order = new Order({
                user: {
                    email: user.email,
                    userId: user._id
                },
                products: products
            });
            return order.save();
        })
        .then(() => {
            return loadedUser.clearCart();
        })
        .then(() => { res.json({ message: 'Order was successfully created' }) })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.userId })
        .then(orders => {
            res.json({ orders: orders });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};