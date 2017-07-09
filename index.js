const jwt = require('jsonwebtoken');
const ms = require('ms');
const shortId = require('shortid');
const once = require('lodash.once');


module.exports = function (redisClient) {

    this.__proto__ = jwt;

    this.sign = function (payload, secretOrPrivateKey, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }
        const jti = payload.jti || shortId.generate() + ':' + (payload.id || payload.data && payload.data.id || '');
        payload.jti = jti;
        if (typeof callback === 'function') {
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
        } else {
            return new Promise(function (resolve, reject) {
                jwt.sign(payload, secretOrPrivateKey, options, function (err, token) {
                    if (err) {
                        return reject(err);
                    }
                    const decode = jwt.decode(token);
                    return set(jti, decode, function (err) {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(token);
                    })
                });
            })

        }

    };

    this.verify = function (token, secretOrPublicKey, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }
        if (typeof callback === 'function') {
            callback = callback && once(callback);
            jwt.verify(token, secretOrPublicKey, options, function (err, decode) {
                if (err) {
                    return callback(err);
                }
                return redisClient.get(decode.jti, function (err, jsonDecode) {
                    if (err) {
                        return callback(err);
                    }
                    if (jsonDecode) {
                        return callback(null, decode)
                    }
                    return callback(new jwt.JsonWebTokenError('jwt destroy'))
                })

            })
        } else {
            return new Promise(function (resolve, reject) {
                jwt.verify(token, secretOrPublicKey, options, function (err, decode) {
                    if (err) {
                        return reject(err);
                    } else {
                        redisClient.get(decode.jti, function (err, jsonDecode) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                if (jsonDecode) {
                                    return resolve(decode);
                                }
                                else {
                                    return reject(new jwt.JsonWebTokenError());
                                }
                            }
                        })
                    }
                })
            })

        }
    };
    
    this.destroy = function (token, secretOrPublicKey, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else {
            options = options || {};
        }

        if (typeof callback === 'function') {
            callback = callback && once(callback);
            this.verify(token, secretOrPublicKey, function (err, decoded) {
                if(err){
                    return callback(err);
                }
                return redisClient.del(decoded.jti, function (err, tmp) {
                    if(err){
                        return callback(err);
                    }
                    return callback(null, decoded);
                })
            })
        } else {
            return new Promise(function (resolve, reject) {
                this.verify(token, secretOrPublicKey, function (err, decoded) {
                    if(err){
                        return reject(err);
                    }
                    return redisClient.del(decoded.jti, function (err) {
                        if(err){
                            return reject(err);
                        }
                        return resolve(null, decoded);
                    })
                })
            })
        }
    };

    function set(jti, decode, cb) {
        if (decode.exp) {
            return redisClient.set(jti, JSON.stringify(decode), 'EX', Math.floor(decode.exp - Date.now() / 1000), cb);
        }
        return redisClient.set(jti, JSON.stringify(decode), cb);
    }
};



