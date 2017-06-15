'use strict';

var url = require('url');

var Default = require('./DefaultService');

module.exports.getSeatAvaliblity = function getSeatAvaliblity (req, res, next) {
  Default.getSeatAvaliblity(req.swagger.params, res, next);
};

module.exports.updateSeatInventory = function updateSeatInventory (req, res, next) {
  Default.updateSeatInventory(req.swagger.params, res, next);
};
