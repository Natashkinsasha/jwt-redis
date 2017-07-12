# jwt-redis

This library completely repeats the entire functionality of the library [jsonwebtoken] (https://www.npmjs.com/package/jsonwebtoken), with one important addition.
Jwt-redis allows you to store the token label in redis to verify validity.
The absence of a token label in redis makes the token not valid. To destroy the token in **jwt-redis**, there is a destroy method.
This makes it possible to make a token not valid until it expires.
Jwt-redis supports both [node_redis] (https://www.npmjs.com/package/redis) and [ioredis] (https://www.npmjs.com/package/ioredis) clients.

# Support

This library is quite fresh, and maybe has bugs. Write me an **email** to *natashkinsash@gmail.com* and I will fix the bug in a few working days.

# Quick start

```javascript
var Redis = require('ioredis');
var redis = new Redis();
var JWTR =  require('jwt-redis');
var jwtr = new JWTR(redis);

var secret = 'secret';
var payload = {};
var options = {}; //optional in all methods

// Create a token
jwtr.sign(payload, secret, options, function (err, token) {
    // If everything went well in the callback, it will return token

    // Token verification
    jwtr.verify(token, secret, options, function (err, decode) {
        // If everything went well in the callback, it will return token payload
    })

    // Destroying the token
    jwtr.destroy(token, secret, options, function (err, decode) {
        // If everything went well in the callback, it will return token payload
    })
}
```

# Expiration time
The lifetime of the token, you can set it the same way as in the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) library.
The label in redis is deleted when the token expires.
```javascript
    // expiresIn - number of seconds through which the token will not be valid
    jwtr.sign({}, 'secret', {expiresIn: expiresIn}, function (err, token) {

    })
    // exp - time at which the token will not be valid
    jwtr.sign({exp: exp}, secret, function (err, token) {

    })
```

# Create jti

For each token, the claims are added **jti**. **Jti** is the identifier of the token.
You can decide for yourself what it will be equal by adding its values to payload.

```javascript
var payload = {jti: 'test'};
jwtr.sign(payload, secret, options, function (err, token) {
})
```

If **jti** in payload is not present, then **jti** is generated based on the **id** field, which will be searched in payload.

```javascript
var payload = {id: 'test'};
jwtr.sign(payload, secret, options, function (err, token) {
})
```

If **id** is not present, then **jti** is generated randomly by the library.

# Destroy token

You can destroy the token through the token itself.

```javascript
    jwtr.destroy(token, secret, options, function (err, decode) {
    })
```

Also you can destroy the token without specifying a secret.

```javascript
    jwtr.destroy(token, options, function (err, decode) {
    })
```

You can also destroy by jti.

```javascript
    jwtr.destroyByJti(jti, options, function (err, decode) {
    })
```

Still it is possible to make all tokens created on the basis of one **id** not valid.

```javascript
    jwtr.destroyById(id, options, function (err, decode) {
    })
```

# Native Promise

All methods except the decode method (since it is synchronous) can return a native Promise.

```javascript
    jwtr
    .sign({}, secret)
    .then(function (token) {

    })
    .catch(function (err) {

    })
```

# Bluebird

If you want to use **Bluebird**, then after the promiscilation all the methods of the library will be available that return Promise,
Only at the end of each method should you add **Async**.

```javascript
    var Promise = require('bluebird');
    var Redis = require('ioredis');
    var redis = new Redis();
    var JWTR =  require('jwt-redis');
    var jwtr = new JWTR(redis);

    var jwtrAsync = Promise.promisifyAll(jwtr);

    jwtr
    .signAsync({}, secret)
    .then(function (token) {

    })
    .catch(function (err) {

    })
```

# API

Method for creating a token.
### jwtr.sign(payload, secretOrPrivateKey, [options, callback]) ###

Method for verifying a token
### jwtr.verify(token, secretOrPublicKey, [options, callback]) ###

Method for breaking the token (if the token does not pass validation, then the error pops up)
### jwtr.destroy(token, secretOrPublicKey, [options, callback]) ###

Method for destroying a token by jti
### jwtr.destroy(jti, [options, callback]) ###

Method for destroying a token by id
### jwtr.destroyById(id, [options, callback]) ###

Method for decoding token
### jwt.decode(token [, options]) ###

jwt-redis fully supports all method options that support the library [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken).
Therefore, it is better to read their documentation in addition. But there are several options that are available only in jwt-redis.
jwt-redis supports two strategies for storing labels in redis: the whitelist and the blacklist. By default, the whitelist strategy is selected.
In the initialization options, you can specify that you want to use a different strategy.

```javascript
var options = {
    blacklist: true;
}
var jwtr = new JWTR(redis, options);
```
If you select a strategy blacklist, blacklist will be set by default with a 30-day expiration time for tokens, unless another time is specified during the creation.
The default time can be specified in the options.

```javascript
var options = {
    blacklist: {exp: 10000};
}
var jwtr = new JWTR(redis, options);
```

Also in the options you can specify a prefix for the redis keys. By default it is *jwt_label:*.

```javascript
var options = {
    prefix: 'example';
}
var jwtr = new JWTR(redis, options);
```
