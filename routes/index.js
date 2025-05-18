var express = require('express');
var router = express.Router();

const requireAuth = require('../middlewares/ensureAuthenticated')


/* GET home page. */
router.get('/', requireAuth, function(req, res, next) {
  res.render('index', { title: 'Peuplier' });
});

/* testimonies url */


/* GET STATS */
router.get(["/stats"], function(req, res, next) {
  res.render("construction");
})

module.exports = router;
