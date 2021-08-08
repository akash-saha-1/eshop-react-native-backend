const express = require('express');
const router = express.Router();
const { Order } = require('./../models/Order');

router.get('/', async (req, res) => {
  const orderList = await Order.find();

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});
