var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.isAuthenticated()){
        res.redirect('/index');
    }
    else{
        res.render('home', { title: 'Express' });
    }
});

router.get('/logout',function(req, res, next){
    if (req.isAuthenticated()){
        req.logout();
        res.redirect('/');
    }
});

module.exports = router;
