const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  countInStock: { type: Number, required: true },
});

const Order = mongoose.model('Orders', orderSchema);

exports.Order = Order;
