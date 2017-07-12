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

describe('Test initialize', function () {
    const ioRedisMockClient = new IORedisMock();
    const redisMockClient = redisMock.createClient();
    const fakeRedisClient = fakeRedis.createClient();
    const redisClients = [fakeRedisClient, ioRedisMockClient, redisMockClient];

    redisClients.forEach(function (redisClient) {
        [{}, {blacklist: true}].forEach(function (options) {
            [new JWTR(redisClient, options), JWTR(redisClient, options)].forEach(function (jwtr) {
                it('sign', function (done) {
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
            });
        })
    })
});
