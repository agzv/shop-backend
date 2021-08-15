const Product = require('../models/product');
const ObjectId = require('mongoose').Types.ObjectId;


exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.status(200).json({ message: 'Products fetched successfully', products: products });
        })
        .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;

    Product.findById(new ObjectId(productId))
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

    Product.findById(new ObjectId(productId))
        .then(product => {
            product.title = title;
            product.description = description;
            product.price = price;
            return product.save();
        })
        .then(() => {
            res.status(200).json('Post updated successfully');
        })
        .catch(err => console.log(err));
};

exports.createProduct = (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;

    const product = new Product({ title, description, price });
    product.save()
        .then(() => {
            res.status(201).json({ message: 'Product was created' })
        })
        .catch(err => {
            console.log(err);
        })
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId;

    Product.findByIdAndDelete(new ObjectId(productId))
        .then(() => {
            res.status(200).json({message: 'Post was deleted sucessfully'});
        })
        .catch(err => console.log(err));
};