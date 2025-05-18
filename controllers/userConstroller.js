const express = require("express");
const router = express.Router();

const User = require('../models/user');

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const passport = require('passport')

exports.register_user_get = asyncHandler(async (req, res, next) => {
    res.render("user_form", {
        title: "Inscription d'un nouvel utilisateur",
        action: "Inscrire un nouvel utilisateur"
    })
});

exports.register_user_post = [
    
    body("username")
        .trim()
        .custom(val => User.usernameUsed(val)),
    
    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("L'adresse courriel doit être valide")
        .custom(val => User.emailUsed(val)),

    body("password_2")
        .custom(async (password_2, { req }) => {
            const password = req.body.password;
            if (password !== password_2) {
                throw new Error('Les mots de passe doivent être identiques')
            }
        }),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            name: req.body.username,
            email: req.body.email,
            pword: hashedPassword,
            status: req.body.status
        })

        if(!errors.isEmpty()){
            res.render("user_form", {
                title: "Inscription d'un nouvel utilisateur",
                user: user,
                errors: errors.array(),
                action: "Inscrire un nouvel utilisateur"
            })
        } else {
            await user.save();
            res.redirect("/utilisateurs/liste")
        }
    })

];

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

exports.list_user_get = asyncHandler( async(req, res, next) => {
    const allUsers = await User.find()
        .sort({ created_at: "desc" })
        .exec();
        
    res.render("user_list", {
        title: "Liste d'utilisateurs",
        user_list: allUsers,
        currentUser_status: req.user.status
    })
});

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