const jwt = require('jsonwebtoken');
const shortId = require('shortid');
const once = require('lodash.once');


module.exports = function (redisClient, options) {

    this.keyspace = options && options.keyspace || 'jwt_label:';

    this.__proto__ = jwt;

    const self = this;

    this.sign = function (payload, secretOrPrivateKey, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }
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
        var jti;
        if (typeof secretOrPublicKey === 'function' || !secretOrPublicKey) {
            callback = secretOrPublicKey;
            options = {};
            jti = token;
        } else if (typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }
        if (jti) {
            if (typeof callback === 'function') {
                return destroyByJTI(jti, callback);
            }
            return promisify(destroyByJTI)(jti);
        }
        if (typeof callback === 'function') {
            return destroy(token, secretOrPublicKey, options, callback);
        }
        return promisify(destroy)(token, secretOrPublicKey, options);
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
        const jti = payload.jti || shortId.generate() + ':' + (payload.id || payload.data && payload.data.id || '');
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

    function verify(token, secretOrPublicKey, options, callback) {
        callback = callback && once(callback);
        jwt.verify(token, secretOrPublicKey, options, function (err, decode) {
            if (err) {
                return callback(err);
            }
            return redisClient.get(self.keyspace + decode.jti, function (err, jsonDecode) {
                if (err) {
                    return callback(err);
                }
                if (jsonDecode) {
                    return callback(null, decode)
                }
                return callback(new jwt.JsonWebTokenError('jwt destroy'))
            })

        })
    }

    function destroy(token, secretOrPublicKey, options, callback) {
        callback = callback && once(callback);
        verify(token, secretOrPublicKey, {}, function (err, decoded) {
            if (err) {
                return callback(err);
            }
            return redisClient.del(self.keyspace + decoded.jti, function (err, tmp) {
                if (err) {
                    return callback(err);
                }
                return callback(null, decoded);
            })
        })
    }

    function destroyByJTI(jti, callback) {
        callback = callback && once(callback);
        return redisClient.del(self.keyspace + jti, function (err, tmp) {
            if (err) {
                return callback(err);
            }
            return callback(null, jti);
        })
    }

    function destroyById(id, options, callback) {
        callback = callback && once(callback);
        return redisClient
            .keys('*' + id, function (err, keys) {
                if (err){
                    return callback(err);
                }
                return redisClient.del(keys, callback)
            })
    }

    function set(jti, decode, cb) {
        if (decode.exp) {
            return redisClient.set(self.keyspace + jti, JSON.stringify(decode), 'EX', Math.floor(decode.exp - Date.now() / 1000), cb);
        }
        return redisClient.set(self.keyspace + jti, JSON.stringify(decode), cb);
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

    return this;
};



