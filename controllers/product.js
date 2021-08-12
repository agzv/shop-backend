

exports.getProducts = (req, res, next) => {
    res.send('It\'s working')
};

exports.createProduct = (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;

    const product = {title, description, price};
    console.log(product);
    res.status(201).json({ message: 'Product was created' })
};