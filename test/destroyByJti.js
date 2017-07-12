const shortid = require('shortid');
const chai = require('chai');
const Promise = require('bluebird');
const rn = require('random-number');
const dirtyChai = require('dirty-chai');
const fakeRedis = require('fakeredis');
const redisMock = require("redis-mock");
const IORedisMock = require('ioredis-mock').default;
const JWTR = require('../index');
const expect = chai.expect;
chai.use(dirtyChai);

describe('Test method destroy', function () {
    const ioRedisMockClient = new IORedisMock();
    const redisMockClient = redisMock.createClient();
    const fakeRedisClient = fakeRedis.createClient();
    const redisClients = [fakeRedisClient, ioRedisMockClient, redisMockClient];

    redisClients.forEach(function (redisClient) {
        [{}, {blacklist: true}].forEach(function (options) {
            const jwtr = new JWTR(redisClient, options);

            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({}, secret, function (err, token) {
                    if (err) {
                        return done(err);
                    }
                    const decode = jwtr.decode(token);
                    return jwtr.destroyByJti(decode.jti, function (err) {
                        if (err) {
                            return done(err);
                        }
                        return jwtr.verify(token, secret, function (err) {
                            if (!err) {
                                return done(new Error('should be error'));
                            }
                            expect(err).to.be.an.instanceof(jwtr.JsonWebTokenError);
                            done();
                        })
                    })
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({}, secret, function (err, token) {
                    if (err) {
                        return done(err);
                    }
                    const decode = jwtr.decode(token);
                    return jwtr.destroyByJti(decode.jti, {}, function (err) {
                        if (err) {
                            return done(err);
                        }
                        return jwtr.verify(token, secret, function (err) {
                            if (!err) {
                                return done(new Error('should be error'));
                            }
                            expect(err).to.be.an.instanceof(jwtr.JsonWebTokenError);
                            done();
                        })
                    })
                })
            });
        })
    })
});
