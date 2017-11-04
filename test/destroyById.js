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

describe('Test method destroyById', function () {
    const ioRedisMockClient = new IORedisMock();
    const redisMockClient = redisMock.createClient();
    const fakeRedisClient = fakeRedis.createClient();
    const redisClients = [fakeRedisClient, ioRedisMockClient, redisMockClient];

    redisClients.forEach(function (redisClient) {
        [{}, {blacklist: true}].forEach(function (options) {
            const jwtr = new JWTR(redisClient, options);
            it('', function (done) {
                const id = shortid.generate();
                jwtr.destroyById(id, function (err) {
                    if (err) {
                        return done(err);
                    }
                    done()
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                const id = shortid.generate();
                jwtr.sign({id: id}, secret, function (err, token) {
                    if (err) {
                        return done(err);
                    }
                    setTimeout(function () {
                        return jwtr.destroyById(id, function (err) {
                            if (err) {
                                return done(err);
                            }
                            return jwtr.verify(token, secret, function (err) {
                                if (!err) {
                                    done(new Error('should be error'));
                                }
                                expect(err).to.be.an.instanceof(jwtr.TokenDestroyedError);
                                done();
                            })
                        })
                    }, 1000)
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                const id = shortid.generate();
                jwtr.sign({id: id}, secret, function (err, token) {
                    if (err) {
                        return done(err);
                    }
                    return jwtr.destroyById(id, function (err) {
                        if (err) {
                            return done(err);
                        }
                        return jwtr.sign({id: id}, secret, function (err, token) {
                            if (err) {
                                return done(err);
                            }
                            return jwtr.verify(token, secret, function (err) {
                                if (err) {
                                    return done(err);
                                }
                                return done();
                            })
                        });
                    })
                })
            });
        })
    })
});
