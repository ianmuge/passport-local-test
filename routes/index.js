const express = require('express');
const createError = require('http-errors');
module.exports =(app)=>{
    app.get('/', function(req, res, next) {
        res.render('index');
    });

    app.use('/auth',require('./auth'));

    app.use(function(req, res, next) {
        next(createError(404));
    });


};
