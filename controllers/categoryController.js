const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      status: 'sucsess',
      category,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const course = await Category.findOneAndDelete(req.params.id);
    req.flash('success', `The ${course.name} category removed successfully`);
    res.redirect('/users/dashboard');
  } catch (error) {
    res.json({
      status: 'fail',
      error,
    });
  }
};