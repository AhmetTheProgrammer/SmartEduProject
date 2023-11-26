const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      user: req.session.userID,
    });
    req.flash("success", `${course.name} has been created successfully`)
    res.status(201).redirect('/courses');
  } catch (error) {
    req.flash("error", `${course.name} something happened! }`)
    res.status(400).redirect('/courses');
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const categorySlug = req.query.categories;
    const query = req.query.search;
    const category = await Category.findOne({ slug: categorySlug }).exec();

    let filter = {};

    if (categorySlug) {
      filter = { category: category._id }; //course modelindeki category category idye eşitse
    }

    if (query) {
      filter = { name: query };
    }

    if (!query && !categorySlug) {
      filter.name = '';
      filter.category = null;
    }
    const courses = await Course.find({
      $or: [
        { name: { $regex: '.*' + filter.name + '.*', $options: 'i' } },
        { category: filter.category },
      ],
    })
      .sort('-createdAt').populate('user');

    const categories = await Category.find();

    res.status(200).render('courses', {
      courses,
      categories,
      page_name: 'courses',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userID });
    const categories = await Category.find();
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('user')
      .exec();

    res.status(200).render('course', {
      course,
      page_name: 'courses',
      user,
      categories,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userID });
    await user.courses.push({ _id: req.body.course_id });
    await user.save();

    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.releaseCourse = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userID });
    await user.courses.pull({ _id: req.body.course_id });
    await user.save();

    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({slug:req.params.slug})

    await User.deleteMany({ courses: req.params.id });

    const usersToUpdate = await User.find({ courses: course._id }); 
    for (const user of usersToUpdate) 
    { user.courses.pull(course._id); 
      await user.save(); 
    }

    req.flash("error", `${course.name} has been deleted successfully`);

    res.status(200).redirect('/users/dashboard');

    
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    
    await Course.findOneAndUpdate({ slug: req.params.slug }, req.body); 

    res.status(200).redirect('/users/dashboard');

    
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};
