const jwt = require('jsonwebtoken');
var JsonWebTokenError = jwt.JsonWebTokenError;

var TokenDestroyError = function (message) {
    JsonWebTokenError.call(this, message);
    this.name = 'TokenDestroyError';
};

TokenDestroyError.prototype = Object.create(JsonWebTokenError.prototype);

TokenDestroyError.prototype.constructor = TokenDestroyError;

module.exports = TokenDestroyError;