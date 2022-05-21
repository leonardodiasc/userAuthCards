var express = require('express');
const router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');

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

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// FlashCard information

const  data  = require('../data/flashcardData.json').data;
const  cards  = data.cards;

// Flashcard routes

router.get( '/', ( req, res ) => {
  const numberOfCards = cards.length;
  const flashcardId = Math.floor( Math.random() * numberOfCards );
  res.redirect( `/${flashcardId}` )
});

router.get('/:id', (req, res) => {
    const side  = req.query.side;
    const  id  = req.params.id;

    if ( !side ) {
        return res.redirect(`/${id}?side=question`);
    }
    const text = cards[id][side];
    const hint  = cards[id].hint;

    const templateData = { id, text, side };

    if ( side === 'question' ) {
      templateData.hint = hint;
      templateData.sideToShow = 'answer';
      templateData.sideToShowDisplay = 'Answer';
    } else if ( side === 'answer' ) {
      templateData.sideToShow = 'question';
      templateData.sideToShowDisplay = 'Question';
    }

    res.render('card', templateData);
});


module.exports = router;
