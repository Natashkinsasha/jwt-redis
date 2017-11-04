var JsonWebTokenError = require('jsonwebtoken').JsonWebTokenError;

var TokenDestroyedError = function (message) {
    JsonWebTokenError.call(this, message);
    this.name = 'TokenDestroyedError';
};

TokenDestroyedError.prototype = Object.create(JsonWebTokenError.prototype);

TokenDestroyedError.prototype.constructor = TokenDestroyedError;

module.exports = TokenDestroyedError;