const express = require('express');
const router = express.Router();
const { Categories } = require('./../models/Categories');

router.get('/', async (req, res) => {
  const categoriesList = await Categories.find();

  if (!categoriesList) {
    res.status(500).json({ success: false });
  }
  res.send(categoriesList);
});
