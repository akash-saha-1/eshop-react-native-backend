const express = require('express');
const router = express.Router();
const { Product } = require('./../models/Product');
const mongoose = require('mongoose');
const { Category } = require('./../models/Category');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/PNG': 'PNG',
    'image/JPG': 'JPG',
    'image/JPEG': 'JPEG',
};

//multer configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const isvalid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type');
        if (isvalid) uploadError = null;
        cb(uploadError, './uploads');
    },
    filename: function(req, file, cb) {
        const fileName = file.originalname.split(' ').join('-').split('.')[0];
        const extention = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extention}`);
    },
});
const upload = multer({ storage: storage });

// get all products or filter by category
router.get('/', async(req, res) => {
    //localhost:123a/api/v/products?categories=1234,1234
    let filter = {};
    if (req.params.categories) {
        filter = { category: req.params.categories.split(',') };
    }

    const productList = await Product.find(filter).populate('category');
    if (!productList) {
        res.status(500).json({ success: false });
    }
    res.send(productList);
});

router.get('/:id', async(req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
        res.status(500).json({ success: false });
    }
    res.send(product);
});

router.post('/', upload.single('image'), async(req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(404).send('Invalid category');

    const file = req.file;
    if (!file) return res.status(400).send('No image found in the request');

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/uploads/`;
    const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        countInStock: req.body.countInStock,
    });
    const product = await newProduct.save();
    if (!product) return res.status(500).send('the product can not be created');

    res.status(201).send(product);
});

router.put('/:id', upload.single('image'), async(req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).send('Invalid product id');
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(404).send('Invalid category');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('No Product found');

    const file = req.file;
    let imagePath = '';

    if (file) {
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/uploads/`;
        imagePath = `${basePath}${fileName}`;
    } else {
        imagePath = product.image;
    }

    let updatedProduct = await Product.findByIdAndUpdate(
        req.params.id, {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
            branch: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
            countInStock: req.body.countInStock,
        }, {
            new: true,
        }
    );

    if (!updatedProduct)
        return res.status(500).send('The product can not be updated');
    res.status(200).send(updatedProduct);
});

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product)
                return res
                    .status(200)
                    .json({ success: true, message: 'The product is deleted!' });
            else
                return res
                    .status(404)
                    .json({ success: false, message: 'product not found' });
        })
        .catch((err) => {
            return res.status(400).json({ success: 'false', error: err });
        });
});

router.get('/get/count', async(req, res) => {
    const productCount = await Product.countDocuments();
    if (!productCount) return res.status(500).json({ success: 'false' });
    res.send({ productCount: productCount });
});

router.get('/get/featured/:count', async(req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const product = await Product.find({ isFeatured: true }).limit(+count); //+ to convert string to numeric
    if (!product) return res.status(500).json({ success: 'false' });
    res.send(product);
});

//to upload multiple images for a product in product gallery
router.put(
    '/gallery-images/:id',
    upload.array('images', 10), //10 is maximum no of files in asingle request
    async(req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).send('Invalid product id');
        }
        const files = req.files;
        let imagePaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/uploads/`;
        if (files) {
            files.map((file) => {
                const fileName = file.filename;
                imagePaths.push(`${basePath}${fileName}`);
            });
        }

        let updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, {
                images: imagePaths,
            }, {
                new: true,
            }
        );

        if (!updatedProduct)
            return res.status(500).send('The product can not be updated');
        res.status(200).send(updatedProduct);
    }
);

module.exports = router;