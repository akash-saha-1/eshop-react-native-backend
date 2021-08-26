const express = require('express');
const router = express.Router();
const { User } = require('./../models/User');
const { Order } = require('./../models/Order');
const { OrderItem } = require('./../models/OrderItem');
const verifyAdmin = require('./../helper/adminVerification');
const sendEmail = require('./../Service/sendMail');

router.get('/', async (req, res) => {
  const dateOrdered = 'dateOrdered';
  const orderList = await Order.find()
    .populate('user', 'name')
    .populate('orderItems')
    .sort({ [dateOrdered]: -1 }); //-1 here indicated reverse order or newest to oldest

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get('/:id', async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
      path: 'orderItems',
      populate: { path: 'product', populate: 'category' },
    });

  if (!order) {
    return res.status(500).json({ success: false });
  }
  res.send(order);
});

router.post('/', async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemsIds;

  if (!orderItemsIdsResolved)
    return res.status(500).send('The order Item can not be created');

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemsId) => {
      const orderItem = await OrderItem.findById(orderItemsId).populate(
        'product',
        'price'
      );
      return orderItem.product.price * +orderItem.quantity;
    })
  );
  const totalPrice = totalPrices.reduce((a, b) => +a + +b, 0);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
    payment: req.body.payment,
    status: req.body.status,
  });

  try {
    order = await order.save();
    if (!order) return res.status(500).send('The order can not be created');
  } catch (err) {
    console.error(err);
    return res.status(500).send('The order can not be created');
  }

  //send mail to user
  try {
    const user = await User.findById(req.body.user).select('-passwordHash');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'the user with the given id was not found.',
      });
    }

    if (user) {
      sendEmail(
        user.email,
        'Order Placed Successfully in Easy Shop',
        `Hi ${user.name},\n You have successfully placed order in Easy Shop.
        Total price of order is ₹ ${totalPrice}. You can view the order in your profile section.`
      );
    }
    res.send(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while send email to user',
    });
  }
});

router.put('/:id', async (req, res) => {
  if (!verifyAdmin(req, res)) {
    let order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    );
    if (!order) return res.status(500).send('The order can not be updated');
    res.status(200).send(order);
  }
});

router.delete('/:id', (req, res) => {
  if (!verifyAdmin(req, res)) {
    Order.findByIdAndRemove(req.params.id)
      .then(async (order) => {
        if (order) {
          await order.orderItems.map(async (orderItem) => {
            await OrderItem.findByIdAndRemove(orderItem);
          });
          return res
            .status(200)
            .json({ success: true, message: 'the order is deleted!' });
        } else {
          return res
            .status(404)
            .json({ success: false, message: 'order not found!' });
        }
      })
      .catch((err) => {
        return res.status(500).json({ success: false, error: err });
      });
  }
});

//to display total sales
router.get('/get/totalsales', async (req, res) => {
  if (!verifyAdmin(req, res)) {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
    ]);

    if (!totalSales)
      return res.status(400).send('The total order sales can not be generated');

    return res.send({ totalSales: totalSales.pop().totalSales });
  }
});

router.get('/get/count', async (req, res) => {
  const orderCount = await Order.countDocuments();
  if (!orderCount) return res.status(500).json({ success: 'false' });
  res.send({ orderCount: orderCount });
});

router.get('/get/userorders/:userid', async (req, res) => {
  const dateOrdered = 'dateOrdered';
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate('user', 'name')
    .populate({
      path: 'orderItems',
      populate: { path: 'product', populate: 'category' },
    })
    .sort({ [dateOrdered]: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
