var express = require('express');
const router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');
var Quote = require('../models/quote');

//GET profile

router.get('/profile', mid.requiresLogIn, function(req, res, next){
  if (!req.session.userId){
    var err = new Error("Viewing this page requires authentication.");
    err.status = 403;
    return next(err);
  }
  User.findById(req.session.userId)
      .exec(function(error, user){
        if(error){
          return next(error);
        }else {
          return res.render('profile', {title: 'Profile', name: user.name, favorite:
          user.favoriteBook});
        }
      });
});

//GET log out
router.get('/logout', function(req,res,next){
  if(req.session){
    req.session.destroy(function(err){
      if(err){
        return next(err);
      } else{
        return res.redirect('/');
      }
    });
  }
});
// GET and POST login
router.get('/login', mid.loggedOut,function(req,res,next){
  return res.render('login',{ title: 'Log In'});
});
router.post('/login', function(req,res,next){
  if(req.body.email && req.body.password){
    User.authenticate(req.body.email, req.body.password, function (error, user){
      if(error || !user){
        var err = new Error('Something is wrong');
        err.status = 401;
        return next(err);
      }else{
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  }else{
    var err = new Error ('The fields email and password are necessary.');
    err.status = 401;
    return next(err);
  }
});
// GET / register
router.get('/register', mid.loggedOut, function(req,res,next){
  return res.render('register', { title: 'Sign up'});
});

//POST/ Register
router.post('/register', (req,res,next)=>{
  if (req.body.email &&
      req.body.name &&
      req.body.favoriteBook &&
      req.body.password &&
      req.body.confirmPassword){
        if(req.body.password !== req.body.confirmPassword){
          var err = new Error('Passwords not matching, retype them.');
          err.status = 400;
          return next(err);
        }
        var userInfo = {
          email: req.body.email,
          name: req.body.name,
          favoriteBook: req.body.favoriteBook,
          password: req.body.password
        }
        //inserting the user information 'userInfo' into mongodb
        User.create(userInfo, (error, user)=>{
          if (error){
            return next(error);
          } else {
            req.session.userId = user._id;
            return res.redirect('/profile');
          }
        });
      } else{
        var err = new Error('Fill all fields, dear one.');
        err.status = 400;
        return next(err);
      }
});
// GET /
//router.get('/', function(req, res, next) {
//  return res.render('index', { title: 'Home' });
//});

// GET /submit
router.get('/submit', mid.requiresLogIn, function(req, res, next) {
  return res.render('submit', { title: 'Submit' });
});

//POST Submit

router.post('/submit', (req,res,next)=>{
  if (req.body.author && req.body.question && req.body.quote) {
    var quoteInfo = {
      author: req.body.author,
      question: req.body.question,
      quote: req.body.quote
    }
    Quote.create(quoteInfo, (error, quote) =>{
      if (error){
        return next(error);
      } else {
        return res.redirect('/');
      }
    });
  }else{
    var err = new Error('All fields must be filled, my dear.');
    err.statuss = 400;
    return next(err);
  }

});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// FlashCard information

router.get('/', (req, res) => {
  Quote.count().exec(function(err, count){
    var random = Math.floor(Math.random() * count);
    Quote.findOne().skip(random)
        .exec(function(error, quote){
          if(error){
            return next(error);
          }else {
            return res.render('index', {title: 'Home', text: quote.quote, hint:
            quote.author, question: quote.question});
        }
      });
    });
});


module.exports = router;
