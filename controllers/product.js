const ObjectId = require('mongoose').Types.ObjectId;

const Product = require('../models/product');
const User = require('../models/user');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.status(200).json({ message: 'Products fetched successfully', products: products });
        })
        .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;

    Product.findById(productId)
        .then(product => {
            res.status(200).json({ message: 'Product fetched successfully', product: product });
        })
        .catch(err => console.log(err));
};

exports.editProduct = (req, res, next) => {
    const productId = req.params.productId;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;

    Product.findById(productId)
        .then(product => {
            product.title = title;
            product.description = description;
            product.price = price;
            return product.save();
        })
        .then(() => {
            res.status(200).json('Product updated successfully');
        })
        .catch(err => console.log(err));
};

exports.createProduct = (req, res, next) => {
    
    console.log(req.file);
    if(!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const imageUrl = req.file.path;
    const creator = req.adminUserId;

    const product = new Product({ title, description, price, imageUrl, creator });
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

    Product.findByIdAndDelete(productId)
        .then(() => {
            res.status(200).json({message: 'Post was deleted sucessfully'});
        })
        .catch(err => console.log(err));
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