const shortid = require('shortid');
const chai = require('chai');
const Promise = require('bluebird');
const rn = require('random-number');
const dirtyChai = require('dirty-chai');
const fakeRedis = require('fakeredis');
const redisMock = require("redis-mock");
const IORedisMock = require('ioredis-mock');
const JWTR = require('../index');
const expect = chai.expect;
chai.use(dirtyChai);

describe('Test method sign', function () {
    const ioRedisMockClient = new IORedisMock();
    const redisMockClient = redisMock.createClient();
    const fakeRedisClient = fakeRedis.createClient();
    const redisClients = [fakeRedisClient, ioRedisMockClient, redisMockClient];

    redisClients.forEach(function (redisClient) {
        [{}, {blacklist: true}].forEach(function (options) {
            const jwtr = new JWTR(redisClient, options);
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
        })
    })
});

