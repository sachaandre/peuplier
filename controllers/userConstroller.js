const express = require("express");
const router = express.Router();

const User = require('../models/user');

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const passport = require('passport')

exports.register_user_get = asyncHandler(async (req, res, next) => {
    res.send("do stuff");
});

exports.register_user_post = asyncHandler(async (req, res, next) => {

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("L'adresse courriel doit être valide")

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
        name: req.body.username,
        email: req.body.email,
        pword: hashedPassword,

    })
    res.send(user);
    //await user.save();

});

exports.login_user_get = asyncHandler( async(req, res, next) => {
    res.render("login");
});

// exports.login_user_post = asyncHandler (async(req, res, next) => {
//     username = req.body.username;
//     password = req.body.password;

    
//     if(user){
        
//         if (isValidPword) {
            
//             req.session.userId = user._id.toString();
//             res.send("good pword");

//         } else {
//             res.render('login', {error: 'Les informations ne matchent pas avec la base de donnée ! Mot de passe incorrect.'});
//         }
//     } else {
//         res.render('login', {error: 'Les informations ne matchent pas avec la base de donnée ! Username incorrect.'})
//     }
// });

exports.createFirstUser = asyncHandler (async(req, res, next) => {
    const userCount = await User.countDocuments();
    if(userCount < 1){
        const hashedPw = await bcrypt.hash("admin_password", 10)
        const user = new User({
            name: "admin",
            pword: hashedPw,
            status: "Admin"
        });
        user.save();
    }
});