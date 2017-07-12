# jwt-redis

This library completely repeats the entire functionality of the library [jsonwebtoken] (https://www.npmjs.com/package/jsonwebtoken), with one important addition.
Jwt-redis allows you to store the token label in redis to verify validity.
The absence of a token label in redis makes the token not valid. To destroy the token in jwt-redis, there is a destroy method.
This makes it possible to make a token not valid until it expires.
Jwt-redis supports both [node_redis] (https://www.npmjs.com/package/redis) and [ioredis] (https://www.npmjs.com/package/ioredis) clients.

# Быстрый старт

```javascript
var Redis = require('ioredis');
var redis = new Redis();
var JWTR =  require('jwt-redis');
var jwtr = new JWTR(redis);

var secret = 'secret';
var payload = {};
var options = {}; //не обязательный параметр во всех методах

//  Создание токена
jwtr.sign(payload, secret, options, function (err, token) {
    //  Если все прошло успешно в колбеке вернет сгенерированный токе err будет равен null
    //  Если нет err будет равен ошибке

    //  Верефикация токена
    jwtr.verify(token, secret, options, function (err, decode) {
        //  Если все прошло успешно в колбеке вернет payload токена
        //  Если нет err будет равен ошибке
    })

    //  Разрушение токена
    jwtr.destroy(token, secret, options, function (err, decode) {
        //  Если все прошло успешно в колбеке вернет payload токена
        //  Если нет err будет равен ошибке
    })
}
```


# jwt-redis

Данная библиотека полностью повторяет весь функционал библиотеки [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), с одним важным дополнением.
jwt-redis позволяет сохранять метку токена в redis для проверки валидности.
Отсутствие метки токена в redis делает токен не валидным. Для разрушения токена в jwt-redis, есть метод destroy.
Это даёт возможность делать токен не валидным до тако, как у него истечёт срок действия.
jwt-redis потдерживает как [node_redis](https://www.npmjs.com/package/redis), так и [ioredis](https://www.npmjs.com/package/ioredis) клиенты.

# Быстрый старт

```javascript
var Redis = require('ioredis');
var redis = new Redis();
var JWTR =  require('jwt-redis');
var jwtr = new JWTR(redis);

var secret = 'secret';
var payload = {};
var options = {}; //необязательный параметр во всех методах

//  Создание токена
jwtr.sign(payload, secret, options, function (err, token) {
    //  Если все прошло успешно в колбеке вернет сгенерированный токе err будет равен null
    //  Если нет err будет равен ошибке

    //  Верефикация токена
    jwtr.verify(token, secret, options, function (err, decode) {
        //  Если все прошло успешно в колбеке вернет payload токена
        //  Если нет err будет равен ошибке
    })
    //  Разрушение токена
    jwtr.destroy(token, secret, options, function (err, decode) {
        //  Если все прошло успешно в колбеке вернет payload токена
        //  Если нет err будет равен ошибке
    })
}
```

# Expiration time

Время жизни токена, можно задать так же как и в библиотеке jsonwebtoken.
Метка в redis удалиться тогда же когда истечет время жизни токена.

```javascript
    // expiresIn - количество секунд через котрое токен станет не валидным
    jwtr.sign({}, 'secret', {expiresIn: expiresIn}, function (err, token) {

    })
    // exp - время в которое токен станет не валидным
    jwtr.sign({exp: exp}, secret, function (err, token) {

    })
```

# Создание jti

Для каждого токена в claims добовляется claim jti. jti это идентификатор токена.
Вы можете сами решить чему он будет равен, добавив его значения в payload.

```javascript
var payload = {jti: 'test'};
jwtr.sign(payload, secret, options, function (err, token) {
})
```

Если jti в payload нет, то jti сгенерируется на основе поля id, которое будет искаться в payload.

```javascript
var payload = {id: 'test'};
jwtr.sign(payload, secret, options, function (err, token) {
})
```

Если и id нет, то jti сгенерируется рандомно библиотекой.

# Разрушение токена

Разрушить токен можно по средствам самого токена.

```javascript
    jwtr.destroy(token, secret, options, function (err, decode) {
    })
```
Так же можно передать jti.

```javascript
    jwtr.destroy(jti, options, function (err, decode) {
    })
```

Ище можно сделать не валидными все токены созданные на основе одно id.

```javascript
    jwtr.destroyById(id, options, function (err, decode) {
    })
```

# Native Promise

Все методы кроме метода decode (так как он синхронный), могут возвращать нативный Promise.

```javascript
    jwtr
    .sign({}, secret)
    .then(function (token) {

    })
    .catch(function (err) {

    })
```

# Bluebird

Если захотите воспользоватся Bluebird, то после промисификации будут доступны все методы библиотке возвращаюшие Promise,
только в конце каждого метода надо добавить Async.

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
