const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  countInStock: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Product = mongoose.model('Products', productSchema);

exports.Product = Product;
