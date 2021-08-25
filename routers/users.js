const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('./../models/User');
const verifyAdmin = require('./../helper/adminVerification');

const jwtSecret = process.env.JWT_SECRET;
const expirationTime = process.env.JWT_EXPIRATION;

router.get('/', async (req, res) => {
  if (!verifyAdmin(req, res)) {
    const userList = await User.find().select('-passwordHash');
    if (!userList) {
      return res.status(500).json({ success: false });
    }
    return res.send(userList);
  }
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (user) return res.status(200).send(user);
  res.status(500).json({
    success: false,
    message: 'the user with the given id was not found.',
  });
});

router.post('/', async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();
  if (!user) return res.status(500).send('The user can not be created');
  res.send(user);
});

router.post('/register', async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();
  if (!user) return res.status(500).send('The user can not be created');
  res.send(user);
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send('user not found');
  }
  let expirationDays = expirationTime.match(/(\d+)/)[0];

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      jwtSecret,
      {
        expiresIn: expirationTime,
      }
    );
    return res
      .status(200)
      .json({ user: user.email, token: token, expirationDays: expirationDays });
  } else {
    return res.status(404).send('user not found.');
  }
});

router.delete('/:id', (req, res) => {
  if (!verifyAdmin(req, res)) {
    User.findByIdAndRemove(req.params.id)
      .then((user) => {
        if (user)
          return res
            .status(200)
            .json({ success: true, message: 'The user is deleted!' });
        else
          return res
            .status(404)
            .json({ success: false, message: 'user not found' });
      })
      .catch((err) => {
        return res.status(400).json({ success: 'false', error: err });
      });
  }
});

router.get('/get/count', async (req, res) => {
  const userCount = await User.countDocuments();
  if (!userCount) return res.status(500).json({ success: 'false' });
  res.send({ userCount: userCount });
});

module.exports = router;
