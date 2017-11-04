var JsonWebTokenError = require('jsonwebtoken').JsonWebTokenError;

var TokenInvalidError = function (message, inconsistencies) {
    JsonWebTokenError.call(this, message);
    this.name = 'TokenInvalidError';
    this.inconsistencies = inconsistencies;
};

TokenInvalidError.prototype = Object.create(JsonWebTokenError.prototype);

TokenInvalidError.prototype.constructor = TokenInvalidError;

module.exports = TokenInvalidError;