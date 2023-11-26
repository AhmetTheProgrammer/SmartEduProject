const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const {body} = require('express-validator');
const User = require('../models/User');

const router = express.Router();

router.route('/signup').post(
    [
        body('name').not().isEmpty().withMessage('Please enter your name'),
        body('email').isEmail().withMessage('Please enter valid email')
        .custom((userEmail)=>{
            const user = User.findOne({email:userEmail});
            if(user){
                return Promise.reject('email is already exists!');
            }
        }),
        body('password').not().isEmpty().withMessage('Please enter a password'),
    ],
    authController.createUser); //localhost/users/signup
router.route('/login').post(authController.loginUser); //localhost/users/login
router.route('/logout').get(authController.logoutUser); //localhost/users/logout
router.route('/dashboard').get(authMiddleware, authController.getDashboardPage); //localhost/users/dashboard
router.route('/:id').delete(authController.deleteUser);

module.exports = router;
