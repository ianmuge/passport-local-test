const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Agenda = require('agenda');
const helmet = require("helmet");
const morgan = require('morgan');
const passport = require('passport');
const flash    = require('connect-flash');
const session      = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const User= require("../models/user");
exports.init=(app)=>{
// view engine setup
    app.set('views', './views');
    app.set('view engine', 'twig');
    app.use(morgan('dev'));
    app.use(cookieParser());
    app.use(express.static('./public'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(helmet());
    app.use(flash());
    mongoose
        .connect(process.env.MONGODB_HOST, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Connected to the Database successfully');
        }).catch((err) => {
        console.log(`Error: ${err}`);
    });
    const agenda=new Agenda({
        mongo: mongoose.connection,
        processEvery: '30 seconds'
    });
    // require("../tasks")(agenda);
    // (async function() {
    //     await agenda.start();
    // })();
    // exports.agenda=agenda;

    app.use(session({ secret: process.env.SECRET_KEY }));
    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    });
    passport.deserializeUser(function(id, done) {
        User.findOne({ _id: id }, function (err, user) {
            done(err, user)
        })
    });
// ======================SIGNUP ===========================
    passport.use('local-signup', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            process.nextTick(function() {
                User.findOne({ 'email' :  email }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        var newUser = new User();
                        newUser.email    = email;
                        newUser.name    = req.body.name;
                        newUser.password = newUser.generateHash(password);
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });

        }));

// =================LOCAL LOGIN ======================================
    passport.use('local-login', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            User.findOne({ 'email' :  email }, function(err, user) {
                if (err)
                    return done(err);
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                return done(null, user);
            });
        }));
};