const User = require('../models/User');

module.exports = async (req, res, next) => {
  const user = await User.findOne({ _id: req.session.userID });

  if(!user){
    return res.redirect('/login');
  }
  next();
};
