var express = require('express');
var router = express.Router();

const passport = require('passport');
const requireAuth = require('../middlewares/ensureAuthenticated')
const isAdmin = require('../middlewares/isAdmin')

const user_controller = require("../controllers/userConstroller");

router.get('/utilisateurs/liste', requireAuth, isAdmin, user_controller.list_user_get)

router.get('/utilisateurs/nouveau', requireAuth, isAdmin, user_controller.register_user_get)
router.post('/utilisateurs/nouveau', requireAuth, isAdmin, user_controller.register_user_post)

router.get('/connexion', user_controller.login_user_get)
router.post('/connexion', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


module.exports = router;
