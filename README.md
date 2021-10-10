# koa-sassy

Modern Koa middleware for compiling SASS and caching cache. It comes with built-in [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) cache-control header support and a easy to use API.

## Install

``` shell
npm i koa-sassy
```

## Getting Started

``` js
const Koa = require('koa')
const sassy = require('koa-sassy')
const app = new Koa()

app.use(sassy('/sass'))

app.listen(3000)
```

## Documentation

### Start Serving SASS

To start compiling and serving SASS files pass **koa-sassy** to `app.use()`. **koa-sassy** comes with grate default options and makes complaining and serving SASS effortless.

``` js
app.use(sassy('/sass'))
```

### Mount SASS to path

By default **koa-sassy** mounts and serves all complied SASS on the `/` path. By setting the `options.mount` parameter it is posiable to mount your SASS to a specified path.

``` js
app.use(sassy('/sass', { mount: '/stylesheets' }))
```

This mounts your complied SASS to the `/stylesheets` path.

### Setting the Cache-Control HTTP Header

The [Cash-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) HTTP header is used to specify browser cashing policies in both client requests and server responses. Use the `options.maxAge` perimeter to pass the number of seconds you wish for clients to cache stylesheets for.

``` js
app.use(sassy('/sass'), { maxAge: 3600 }) // 1 hour
```

> **koa-sassy** default value for `options.maxAge` is 86400 (1 day), and will max out at 31536000 (1 year)

### ETags and Request Freshness

An [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) is a unique identifer assigned by the web server to a specific version of a resource then passed to the client within the HTTP ETag header of the response. When the resource is updated or changed a new unique ETag is generated. **koa-sassy** uses the [**etag**](https://github.com/jshttp/etag) module to generate ETags. 

Request freshness is determined by matching the current resources ETag against the ETag received from the [If-None-Match](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match) HTTP request header. Fresh requests are responded with a status code of **304** (not modified) and stale requests are sent a status code of **200** along with the favicon in the response body. Support for ETags and freshness checking is built into **koa-sassy** by default.

## Contributing

Contributors are welcome, feel free to submit a new [pull request](https://github.com/dominicegginton/koa-sassy/pulls)  to help improve **koa-sassy**.
