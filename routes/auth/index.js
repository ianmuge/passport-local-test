let route = require('express').Router();
const passport = require('passport');
route.get('/login', async (req, res, next) => {
    res.render('auth/login', { message: req.flash('loginMessage') });
});
route.get('/signup', async (req, res, next) => {
    res.render('auth/signup', { message: req.flash('signupMessage') });
});
route.get('/profile',isLoggedIn, async (req, res, next) => {
    res.render('auth/profile', { user : req.user });
});
route.get('/logout', async (req, res, next) => {
    req.logout();
    res.redirect('/');
});
// process the signup form
route.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/auth/profile', //redirect to the secure profile section
    failureRedirect : '/auth/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// process the login form
route.post('/login', passport.authenticate('local-login',{
    successRedirect : '/auth/profile', //redirect to the secure profile section
    failureRedirect : '/auth/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));


// makes sure a user is logged in
function isLoggedIn(req, res, next){

// if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

// if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = route;