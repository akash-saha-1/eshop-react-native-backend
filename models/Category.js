const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  countInStock: { type: Number, required: true },
});

const Category = mongoose.model('Categorys', categorySchema);

exports.Category = Category;
