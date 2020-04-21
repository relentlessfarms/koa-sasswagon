# koa-sassy

[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/dominicegginton/koa-sassy/CI/master?label=CI)](https://github.com/dominicegginton/koa-sassy/actions)
[![Code Climate coverage](https://img.shields.io/codeclimate/coverage/dominicegginton/koa-sassy)](https://codeclimate.com/github/dominicegginton/koa-sasssy)
[![npm](https://img.shields.io/npm/dt/koa-sassy?label=Downloads)](https://www.npmjs.com/package/koa-sassy)
[![js-standard-style](https://img.shields.io/badge/Code%20Style-standard-brightgreen.svg)](http://standardjs.com)

> :art: Modern Koa middleware for SASS

## Why

- Caches complied CSS for fast responses
- Built-in [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) support
- Cache-control header support
- Easy to use API :package:

## Install

``` shell
npm i koa-sassy
```

## Usage

``` js
const Koa = require('koa')
const sassy = require('koa-sassy')
const app = new Koa()

app.use(sassy('/sass'))

app.listen(3000)
```

## API

### sassy(src, options) ⇒ `function`

serves cached sass as complied css

**Kind**: exported function  
**Returns**: `function` - middleware serving complied css

| Param | Type | Description |
| --- | --- | --- |
| src | `String` | path to sass directory |
| options | `Object` | koa-sassy options object |
| mount | `string` | mount point for css to be severed - default `/` |
| options.maxAge | `Number` | maximum time the favicon is considered fresh - default one day |

## Documentation

### Start Serving SASS

To start compiling and serving SASS files pass **koa-sassy's** middleware to `app.use()`. **koa-sassy** comes with grate default options and makes complaining and serving SASS effortless.

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

The [cash-control header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) holds directives (instructions) for caching in both requests and responses and is used to determine how long a given resource is considered fresh

**koa-sassy** makes it easy to control how long your favicon is considered fresh. Pass the maximum age in seconds in the `options.maxAge` perimeter

``` js
app.use(sassy('/sass'), { maxAge: 3600 }) // 1 hour
```

> **koa-sassy** default value for `options.maxAge` is 86400 (1 day), and will max out at 31536000 (1 year)

### ETags and Request Freshness

An [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) is a identifer assigned by a web server to a specific version of a resource, and passed to the client within the HTTP ETag header of the response. When the resource at a given URL is updated a new unique ETag is generated. **koa-sassy** uses the [**etag**](https://github.com/jshttp/etag) module to generate ETags.

Request freshness is determined by matching the current resources ETag against the ETag received from the [If-None-Match](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match) HTTP request header. Fresh requests are responded with a status code of **304** (not modified) and stale requests are sent a status code of **200** along with the favicon in the response body. Support for ETags and freshness checking is built into **koa-sassy** by default.

## Contributing

Contributors are welcome, feel free to submit a new [pull request](https://github.com/dominicegginton/koa-sassy/pulls)  to help improve **koa-sassy**.