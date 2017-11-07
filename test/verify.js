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

describe('Test method verify', function () {
    const ioRedisMockClient = new IORedisMock();
    const redisMockClient = redisMock.createClient();
    const fakeRedisClient = fakeRedis.createClient();
    const redisClients = [fakeRedisClient, ioRedisMockClient, redisMockClient];

    redisClients.forEach(function (redisClient) {
        [{}, {blacklist: true}].forEach(function (options) {
            const jwtr = new JWTR(redisClient, options);
            it('', function (done) {
                const token = shortid.generate();
                const secret = shortid.generate();
                jwtr.verify(token, secret, function (err) {
                    if (!err) {
                        done(new Error('should be error'));
                    }
                    expect(err).to.be.an.instanceof(JWTR.JsonWebTokenError);
                    done();
                })
            });


            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    jwtr.verify(token, secret, function (err, decode) {
                        if (err) {
                            done(err);
                        }
                        expect(decode).to.have.property('jti');
                        expect(decode).to.have.property('iat');
                        expect(decode.jti).to.be.a('string');
                        expect(decode.iat).to.be.a('number');
                        done();
                    })
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({test: 'test'}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    jwtr.verify(token, secret, {eql: {test: 'test'}}, function (err, decode) {
                        if (err) {
                            done(err);
                        }
                        expect(decode).to.have.property('jti');
                        expect(decode).to.have.property('iat');
                        expect(decode).to.have.property('test', 'test');
                        expect(decode.jti).to.be.a('string');
                        expect(decode.iat).to.be.a('number');
                        done();
                    })
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({test: 'test'}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    jwtr.verify(token, secret, {eql: {test: ['test']}}, function (err, decode) {
                        if (err) {
                            done(err);
                        }
                        expect(decode).to.have.property('jti');
                        expect(decode).to.have.property('iat');
                        expect(decode).to.have.property('test', 'test');
                        expect(decode.jti).to.be.a('string');
                        expect(decode.iat).to.be.a('number');
                        done();
                    })
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({test: ['test']}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    jwtr.verify(token, secret, {eql: {test: ['test']}}, function (err, decode) {
                        if (err) {
                            done(err);
                        }
                        expect(decode).to.have.property('jti');
                        expect(decode).to.have.property('iat');
                        expect(decode).to.have.deep.property('test', ['test']);
                        expect(decode.jti).to.be.a('string');
                        expect(decode.iat).to.be.a('number');
                        done();
                    })
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({test: ['test']}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    jwtr.verify(token, secret, {eql: {test: 'test'}}, function (err, decode) {
                        if (err) {
                            done(err);
                        }
                        expect(decode).to.have.property('jti');
                        expect(decode).to.have.property('iat');
                        expect(decode).to.have.deep.property('test', ['test']);
                        expect(decode.jti).to.be.a('string');
                        expect(decode.iat).to.be.a('number');
                        done();
                    })
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({test: 'test'}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    jwtr.verify(token, secret, {eql: {test: 'tes'}}, function (err, decode) {
                        if (!err) {
                            done('should be error');
                        }
                        done();
                    })
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                const expiresIn = 3;
                jwtr.sign({}, secret, {expiresIn: expiresIn}, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    jwtr.verify(token, secret, function (err, decode) {
                        if (err) {
                            done(err);
                        }
                        expect(decode).to.have.property('jti');
                        expect(decode).to.have.property('iat');
                        expect(decode).to.have.property('exp');
                        expect(decode.jti).to.be.a('string');
                        expect(decode.iat).to.be.a('number');
                        expect(decode.exp).to.be.a('number');
                        expect(decode.exp - decode.iat).to.equal(expiresIn);
                        done();
                    })
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                const expiresIn = 2;
                jwtr.sign({}, secret, {expiresIn: expiresIn}, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    else {
                        setTimeout(function () {
                            jwtr.verify(token, secret, function (err, decode) {
                                if (!err) {
                                    done(new Error('should be error'));
                                }
                                else {
                                    expect(err).to.be.an.instanceof(JWTR.JsonWebTokenError);
                                    done();
                                }
                            })
                        }, expiresIn * 1000);
                    }
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    jwtr.verify(token, secret)
                        .then(function (decode) {
                            expect(decode).to.have.property('jti');
                            expect(decode).to.have.property('iat');
                            expect(decode.jti).to.be.a('string');
                            expect(decode.iat).to.be.a('number');
                            done();
                        })
                        .catch(done)
                })
            });

            it('', function (done) {
                const token = shortid.generate();
                const secret = shortid.generate();
                jwtr.verify(token, secret)
                    .then(done)
                    .catch(function (err) {
                        expect(err).to.be.an.instanceof(JWTR.JsonWebTokenError);
                        done();
                    })
            });

        })
    })
});
