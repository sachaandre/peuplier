var express = require('express');
var router = express.Router();

const passport = require('passport');
const requireAuth = require('../middlewares/ensureAuthenticated')

const user_controller = require("../controllers/userConstroller");

router.get('/inscription', requireAuth, user_controller.register_user_get)
router.post('/inscription', requireAuth, user_controller.register_user_post)

router.get('/connexion', user_controller.login_user_get)
router.post('/connexion', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


module.exports = router;
