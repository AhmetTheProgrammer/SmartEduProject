const User = require('../models/User');
const Category = require('../models/Category');
const bcrypt = require('bcrypt');
const Course = require('../models/Course');
const { validationResult } = require('express-validator');

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).redirect('/login');
  } catch (error) {
    const errors = validationResult(req);

    for (let i = 0; i < errors.array().length; i++) {
      req.flash('error', `${errors.array()[i].msg}`);
    }
    res.status(400).redirect('/register');
  }
};
exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const match = await bcrypt.compare(req.body.password, user.password);

      if (match) {
        //USER SESSION
        console.log('basarili');
        req.session.userID = user._id;
        res.status(200).redirect('/users/dashboard');
      } else {
        req.flash('error', 'Your password is not correct!');
        res.status(400).redirect('/login');
      }
    } else {
      req.flash('error', 'User is not exist!');
      res.status(400).redirect('/login');
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.getDashboardPage = async (req, res) => {
  const user = await User.findOne({ _id: req.session.userID }).populate(
    'courses'
  );
  const categories = await Category.find();
  const courses = await Course.find({ user: req.session.userID });
  const users = await User.find();
  res.status(200).render('dashboard', {
    page_name: 'dashboard',
    user,
    users,
    categories,
    courses,
  });
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id });
    // Eğer silinen kullanıcı öğretmense
    // oluşturduğu kursları silelim
    const courses = await Course.find({ user: req.params.id });
    courses.forEach( async (course) => {
      const users = await User.find();
      users.forEach((user) => {
        if(user.courses.includes(course)) {
          user.courses.pull(course);
          user.save();
        }
      });
    });
    await Course.deleteMany({ user: req.params.id });
    await User.updateMany({});
    req.flash('success', 'User was deleted successfully');
    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    console.log(error);
    req.flash('error', `${error}`);
    res.redirect('/users/dashboard');
  }
};
