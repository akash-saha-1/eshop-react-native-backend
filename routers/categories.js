const express = require('express');
const router = express.Router();
const { Category } = require('./../models/Category');

router.get('/', async (req, res) => {
  const categoriesList = await Categories.find();

  if (!categoriesList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoriesList);
});

router.get('/:id', async (req, res) => {
  const category = Category.findById(req.params.id);
  if (category) return res.status(200).send(category);
  res.status(500).json({
    success: false,
    message: 'the category with the given id was not found.',
  });
});

router.post('/', async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();
  if (!category) return res.status(500).send('The category can not be created');
  res.send(category);
});

router.put('/:id', async (req, res) => {
  let category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    {
      new: true,
    }
  );
  if (!category) return res.status(500).send('The category can not be updated');
  res.status(200).send(category);
});

router.delete('/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category)
        return res
          .status(200)
          .json({ success: true, message: 'The category is deleted!' });
      else
        return res
          .status(404)
          .json({ success: false, message: 'category not found' });
    })
    .catch((err) => {
      return res.status(400).json({ success: 'false', error: err });
    });
});

module.exports = router;
