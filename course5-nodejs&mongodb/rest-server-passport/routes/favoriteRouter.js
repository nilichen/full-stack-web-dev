var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Verify = require('./verify');
var Favorites = require('../models/favorites');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.all(Verify.verifyOrdinaryUser)
.get(function (req, res, next) {
    var userId = req.decoded._id;
    Favorites.findOne({ postedBy: userId })
        .populate('postedBy dishes')
        .exec(function (err, favorites) {
        if (err) next(err);
        res.json(favorites);
    });
})

.post(function (req, res, next) {
    var userId = req.decoded._id;
    var dishId = req.body._id;
    Favorites.find( {postedBy: userId })
        .exec(function (err, favorite) {
            if (err) next(err);
            if (favorite.length > 0) {
                favorite[0].dishes.push(dishId);
                favorite[0].save(function (err, favorite) {
                    if (err) next(err);
                    res.json(favorite);
                });
            }
            else {
                Favorites.create( {postedBy: userId, dishes: [dishId]}, function(err, favorite) {
                    if (err) next(err);
                    res.json(favorite);
                });
            }
        });
})

.delete(function (req, res, next) {
    var userId = req.decoded._id;
    Favorites.remove({ postedBy: userId}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});



favoriteRouter.route('/:favId')
.all(Verify.verifyOrdinaryUser)
.delete(function (req, res, next) {
    var userId = req.decoded._id;
    var dishId = req.params.favId;
    Favorites.update( {postedBy: userId}, 
        { $pull: {dishes: dishId }}, function(err, resp) {
            if (err) next(err);
            res.json(resp);
        });    
});

module.exports = favoriteRouter;