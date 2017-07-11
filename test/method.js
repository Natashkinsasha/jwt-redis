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

describe('Test', function () {
    const ioRedisMockClient = new IORedisMock();
    const redisMockClient = redisMock.createClient();
    const fakeRedisClient = fakeRedis.createClient();
    const redisClients = [fakeRedisClient, ioRedisMockClient, redisMockClient];

    redisClients.forEach(function (redisClient) {
        const jwtr = new JWTR(redisClient);

        it('', function (done) {
            const jwtrT = JWTR(redisClient);
            const secret = shortid.generate();
            jwtrT.sign({}, secret, function (err, token) {
                if (err) {
                    done(err);
                }
                const decode = jwtr.decode(token);
                expect(decode).to.have.property('jti');
                expect(decode).to.have.property('iat');
                expect(decode.jti).to.be.a('string');
                expect(decode.iat).to.be.a('number');
                done();

            })
        });

        describe('#bluebird', function () {
            const jwtrAsync = Promise.promisifyAll(jwtr);
            it('signAsync', function (done) {
                const secret = shortid.generate();
                jwtrAsync
                    .signAsync({}, secret)
                    .then(function (token) {
                        const decode = jwtr.decode(token);
                        expect(decode).to.have.property('jti');
                        expect(decode).to.have.property('iat');
                        expect(decode.jti).to.be.a('string');
                        expect(decode.iat).to.be.a('number');
                        done();
                    })
                    .catch(done);
            });

            it('verifyAsync', function (done) {
                const secret = shortid.generate();
                jwtrAsync.sign({}, secret, function (err, token) {
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


            it('destroyAsync', function (done) {
                const secret = shortid.generate();
                jwtrAsync.sign({}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    jwtr.destroy(token, secret)
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
        });


        describe('#sign', function () {
            it.skip('', function (done) {
                const jwtrT = new JWTR();
                const secret = shortid.generate();
                jwtrT.sign({}, secret, function (err) {
                    if (!err) {
                        done(new Error('should be error'));
                    }
                    expect(err).to.be.an.instanceof(Error);
                    done();
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    const decode = jwtr.decode(token);
                    expect(decode).to.have.property('jti');
                    expect(decode).to.have.property('iat');
                    expect(decode.jti).to.be.a('string');
                    expect(decode.iat).to.be.a('number');
                    done();

                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                jwtr
                    .sign({}, secret)
                    .then(function (token) {
                        const decode = jwtr.decode(token);
                        expect(decode).to.have.property('jti');
                        expect(decode).to.have.property('iat');
                        expect(decode.jti).to.be.a('string');
                        expect(decode.iat).to.be.a('number');
                        done();
                    })
                    .catch(done);
            });

            it('', function (done) {
                const secret = shortid.generate();
                const id = shortid.generate();
                jwtr.sign({id: id}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    const decode = jwtr.decode(token);
                    expect(decode).to.have.property('jti');
                    expect(decode.jti).to.have.string(id);
                    expect(decode).to.have.property('iat');
                    expect(decode.jti).to.be.a('string');
                    expect(decode.iat).to.be.a('number');
                    done();

                });
            });

            it('', function (done) {
                const secret = shortid.generate();
                const jti = shortid.generate();
                jwtr.sign({jti: jti}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    const decode = jwtr.decode(token);
                    expect(decode).to.have.property('jti', jti);
                    expect(decode).to.have.property('iat');
                    expect(decode.jti).to.be.a('string');
                    expect(decode.iat).to.be.a('number');
                    done();

                });
            });

            it('', function (done) {
                const secret = shortid.generate();
                const data = shortid.generate();
                jwtr.sign({data: data}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    const decode = jwtr.decode(token);
                    expect(decode).to.have.property('data', data);
                    expect(decode).to.have.property('iat');
                    expect(decode.jti).to.be.a('string');
                    expect(decode.iat).to.be.a('number');
                    done();

                });
            });

            it('', function (done) {
                const secret = shortid.generate();
                const expiresIn = rn({
                    min: 1, max: 1000, integer: true
                });
                jwtr.sign({}, secret, {expiresIn: expiresIn}, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    const decode = jwtr.decode(token);
                    expect(decode).to.have.property('jti');
                    expect(decode).to.have.property('iat');
                    expect(decode).to.have.property('exp');
                    expect(decode.jti).to.be.a('string');
                    expect(decode.iat).to.be.a('number');
                    expect(decode.exp).to.be.a('number');
                    expect(decode.exp - decode.iat).to.equal(expiresIn);
                    done();

                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                const exp = Math.floor(Date.now() / 1000) + rn({
                        min: 1, max: 1000, integer: true
                    });
                jwtr.sign({exp: exp}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    const decode = jwtr.decode(token);
                    expect(decode).to.have.property('jti');
                    expect(decode).to.have.property('iat');
                    expect(decode).to.have.property('exp');
                    expect(decode.jti).to.be.a('string');
                    expect(decode.iat).to.be.a('number');
                    expect(decode.exp).to.be.a('number');
                    expect(decode.exp).to.equal(exp);
                    done();

                })
            });
        });


        describe('#verify', function () {
            it('', function (done) {
                const token = shortid.generate();
                const secret = shortid.generate();
                jwtr.verify(token, secret, function (err) {
                    if (!err) {
                        done(new Error('should be error'));
                    }
                    expect(err).to.be.an.instanceof(jwtr.JsonWebTokenError);
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
                                    expect(err).to.be.an.instanceof(jwtr.JsonWebTokenError);
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
                        expect(err).to.be.an.instanceof(jwtr.JsonWebTokenError);
                        done();
                    })
            });
        });

        describe('#destroy', function () {
            it('', function (done) {
                const token = shortid.generate();
                const secret = shortid.generate();
                jwtr.destroy(token, secret, function (err) {
                    if (!err) {
                        return done(new Error('should be error'));
                    }
                    expect(err).to.be.an.instanceof(jwtr.JsonWebTokenError);
                    done();
                })
            });


            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({}, secret, function (err, token) {
                    if (err) {
                        return done(err);
                    }
                    return jwtr.destroy(token, secret, function (err, decode) {
                        if (err) {
                            return done(err);
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
                jwtr.sign({}, secret, function (err, token) {
                    if (err) {
                        return done(err);
                    }
                    return jwtr.destroy(token, secret, function (err) {
                        if (err) {
                            return done(err);
                        }
                        return jwtr.verify(token, secret, function (err) {
                            if (!err) {
                                done(new Error('should be error'));
                            }
                            expect(err).to.be.an.instanceof(jwtr.JsonWebTokenError);
                            done();
                        })
                    })
                })
            });


            it('', function (done) {
                const token = shortid.generate();
                const secret = shortid.generate();
                jwtr.destroy(token, secret)
                    .then(done)
                    .catch(function (err) {
                        expect(err).to.be.an.instanceof(jwtr.JsonWebTokenError);
                        done();
                    })
            });

            it('', function (done) {
                const secret = shortid.generate();
                jwtr.sign({}, secret, function (err, token) {
                    if (err) {
                        done(err);
                    }
                    jwtr.destroy(token, secret)
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
                const secret = shortid.generate();
                jwtr.sign({}, secret, function (err, token) {
                    if (err) {
                        return done(err);
                    }
                    const decode = jwtr.decode(token);
                    return jwtr.destroy(decode.jti, function (err) {
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

        });

        describe('#destroyById', function () {
            it('', function (done) {
                const secret = shortid.generate();
                const id = shortid.generate();
                jwtr.sign({id: id}, secret, function (err, token) {
                    if (err) {
                        return done(err);
                    }
                    return jwtr.destroyById(id, function (err, number) {
                        expect(number).to.be.equal(1);
                        if (err) {
                            return done(err);
                        }
                        return jwtr.verify(token, secret, function (err) {
                            if (!err) {
                                done(new Error('should be error'));
                            }
                            expect(err).to.be.an.instanceof(jwtr.JsonWebTokenError);
                            done();
                        })
                    })
                })
            });

            it('', function (done) {
                const secret = shortid.generate();
                const id = shortid.generate();
                Promise
                    .all([
                        jwtr.sign({id: id}, secret),
                        jwtr.sign({id: id}, secret)
                    ])
                    .then(function () {
                        return jwtr.destroyById(id, function (err, number) {
                            expect(number).to.be.equal(2);
                            if (err) {
                                return done(err);
                            }
                            done();
                        })
                    })
                    .catch(done);
            });
        });
    });
});
