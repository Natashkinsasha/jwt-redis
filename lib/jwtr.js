const jwt = require('jsonwebtoken');
const shortId = require('shortid');
const once = require('lodash.once');

exports.JsonWebTokenError = jwt.JsonWebTokenError;
exports.NotBeforeError = jwt.NotBeforeError;
exports.TokenExpiredError = jwt.TokenExpiredError;


exports = module.exports = JWTR;

function JWTR(redisClient, options) {

    this.prefix = options && options.prefix || 'jwt_label:';
    this.blacklist = (options && options.blacklist) || false;
    this.exp = (options && options.blacklist && isNumeric(options.blacklist.exp)) || 60 * 60 * 24 * 30;
    this.defOptions = (this.blacklist && {expiresIn: this.exp}) || {};


    const set = this.blacklist && setBlacklist || setWhitelist;
    const destroy = this.blacklist && destroyBlacklist || destroyWhitelist;
    const destroyById = this.blacklist && destroyByIdBlacklist || destroyByIdWhitelist;
    const destroyByJTI = this.blacklist && destroyByJTIBlacklist || destroyByJTIWhitelist;
    const verify = this.blacklist && verifyBlacklist || verifyWhitelist;
    this.__proto__ = jwt;

    const self = this;

    this.sign = function (payload, secretOrPrivateKey, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }
        options = !payload.exp && Object.assign(self.defOptions, options);
        if (typeof callback === 'function') {
            return sign(payload, secretOrPrivateKey, options, callback);
        }
        return promisify(sign)(payload, secretOrPrivateKey, options);
    };


    this.verify = function (token, secretOrPublicKey, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }
        if (typeof callback === 'function') {
            return verify(token, secretOrPublicKey, options, callback);
        }
        return promisify(verify)(token, secretOrPublicKey, options);
    };

    this.destroy = function (token, secretOrPublicKey, options, callback) {
        var justToken;
        if (typeof secretOrPublicKey === 'function' || !secretOrPublicKey) {
            callback = secretOrPublicKey;
            options = {};
            justToken = token;
        } else if (typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }
        if (justToken){
            if (typeof callback === 'function') {
                return justDestroyWhitelist(token, options, callback);
            }
            return promisify(justDestroyWhitelist)(token,  options);
        }
        if (typeof callback === 'function') {
            return destroy(token, secretOrPublicKey, options, callback);
        }
        return promisify(destroy)(token, secretOrPublicKey, options);
    };

    this.destroyByJti = function (jti, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }
        if (typeof callback === 'function') {
            return destroyByJTI(jti, callback);
        }
        return promisify(destroyByJTI)(jti);
    };

    this.destroyById = function (id, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }
        if (typeof callback === 'function') {
            return destroyById(id, options, callback);
        }
        return promisify(destroyById)(id, options);
    };

    function sign(payload, secretOrPrivateKey, options, callback) {
        const jti = payload.jti || (payload.id || payload.data && payload.data.id || 'true') + ':' + shortId.generate();
        payload.jti = jti;

        callback = callback && once(callback);
        jwt.sign(payload, secretOrPrivateKey, options, function (err, token) {
            if (err) {
                return callback(err);
            }
            const decode = jwt.decode(token);
            set(jti, decode, function (err) {
                if (err) {
                    return callback(err)
                }
                return callback(null, token)
            })

        });
    }

    function verifyWhitelist(token, secretOrPublicKey, options, callback) {
        callback = callback && once(callback);
        jwt.verify(token, secretOrPublicKey, options, function (err, decode) {
            if (err) {
                return callback(err);
            }
            return additionalVerification(decode, options.eql, function (err) {
                if (err) {
                    return callback(err);
                }
                return redisClient.get(self.prefix + decode.jti, function (err, jsonDecode) {
                    if (err) {
                        return callback(err);
                    }
                    if (redisVerifyWhitelist(jsonDecode)) {
                        return callback(null, decode)
                    }
                    return callback(new jwt.JsonWebTokenError('destroyed jwt'))
                })
            })
        })
    }

    function verifyBlacklist(token, secretOrPublicKey, options, callback) {
        callback = callback && once(callback);
        jwt.verify(token, secretOrPublicKey, options, function (err, decode) {
            if (err) {
                return callback(err);
            }
            return additionalVerification(decode, options.eql, function (err) {
                if (err) {
                    return callback(err);
                }
                return redisClient.get(self.prefix + decode.jti, function (err, jsonDecode) {
                    if (err) {
                        return callback(err);
                    }
                    if (redisVerifyBlacklist(jsonDecode)) {
                        return redisClient.get(self.prefix + decode.jti.match(/(.*):/)[0], function (err, jsonDecode) {
                            if (redisVerifyBlacklist(jsonDecode, decode.iat)) {
                                return callback(null, decode)
                            }
                            return callback(new jwt.JsonWebTokenError('jwt destroy'))
                        })

                    }
                    return callback(new jwt.JsonWebTokenError('jwt destroy'))
                })
            })

        })
    }

    function destroyWhitelist(token, secretOrPublicKey, options, callback) {
        callback = callback && once(callback);
        verify(token, secretOrPublicKey, {}, function (err, decoded) {
            if (err) {
                return callback(err);
            }
            return redisClient.del(self.prefix + decoded.jti, function (err) {
                if (err) {
                    return callback(err);
                }
                return callback(null, decoded);
            })
        })
    }

    function destroyBlacklist(token, secretOrPublicKey, options, callback) {
        callback = callback && once(callback);
        verify(token, secretOrPublicKey, {}, function (err, decoded) {
            if (err) {
                return callback(err);
            }
            return redisClient.set(self.prefix + decoded.jti, 'true', 'EX', self.exp, function (err, tmp) {
                if (err) {
                    return callback(err);
                }
                return callback(null, decoded);
            })
        })
    }

    function justDestroyWhitelist(token, options, callback) {
        var decoded = jwt.decode(token);
        callback = callback && once(callback);
        return redisClient.del(self.prefix + decoded.jti, function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null, decoded);
        })

    }

    function justDestroyBlacklist(token, options, callback) {
        var decoded = jwt.decode(token);
        callback = callback && once(callback);
        return redisClient.set(self.prefix + decoded.jti, 'true', 'EX', self.exp, function (err, tmp) {
            if (err) {
                return callback(err);
            }
            return callback(null, decoded);
        })
    }

    function destroyByJTIWhitelist(jti, callback) {
        callback = callback && once(callback);
        return redisClient.del(self.prefix + jti, function (err, tmp) {
            if (err) {
                return callback(err);
            }
            return callback(null, jti);
        })
    }

    function destroyByJTIBlacklist(jti, callback) {
        callback = callback && once(callback);
        return redisClient.set(self.prefix + jti, 'true', 'EX', self.exp, function (err, tmp) {
            if (err) {
                return callback(err);
            }
            return callback(null, jti);
        })
    }

    function destroyByIdWhitelist(id, options, callback) {
        callback = callback && once(callback);
        return redisClient
            .keys(self.prefix + id + '*', function (err, keys) {
                if (err) {
                    return callback(err);
                }
                if (keys.length) {
                    return redisClient.del(keys, function (err) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, true);
                    })
                }
                return callback(null, true);
            })
    }

    function destroyByIdBlacklist(id, options, callback) {
        callback = callback && once(callback);
        return redisClient
            .set(self.prefix + id + ':', Math.floor(Date.now() / 1000), 'EX', self.exp, function (err, keys) {
                if (err) {
                    return callback(err);
                }
                return callback(null, true);
            })
    }


    function setWhitelist(jti, decode, cb) {
        if (decode.exp) {
            return redisClient.set(self.prefix + jti, 'true', 'EX', Math.floor(decode.exp - Date.now() / 1000), cb);
        }
        return redisClient.set(self.prefix + jti, 'true', cb);
    }

    function setBlacklist(jti, decode, cb) {
        return cb(null, decode);
    }

    function promisify(func) {
        return function () {
            const funcArguments = [].slice.call(arguments);
            return new Promise(function (resolve, reject) {
                funcArguments[funcArguments.length] = function (err, answer) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(answer);
                };
                return func.apply(this, [].slice.call(funcArguments));
            })
        }
    }

    function redisVerifyWhitelist(value) {
        return value === 'true';
    }

    function redisVerifyBlacklist(value, iat) {
        return ((iat && iat >= value) || (!iat && value !== 'true'));
    }

    function additionalVerification(payloade, rules, cb) {
        if (rules) {
            return Object.keys(rules).forEach(function (ruleKey) {
                var match;
                const targets = Array.isArray(payloade[ruleKey]) ? payloade[ruleKey] : [payloade[ruleKey]];
                if (payloade[ruleKey]) {
                    const rule = Array.isArray(rules[ruleKey]) ? rules[ruleKey] : [rules[ruleKey]];
                    match = targets.some(function (target) {
                        return rule.indexOf(target) !== -1;
                    });
                }
                if (!match) {
                    return cb(new JsonWebTokenError('jwt ruleKey invalid. expected: ' + targets.join(' or ')));
                }
                return cb();
            })
        }
        return cb()
    }

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    return this;
};