# koa-sassy

> Modern Node.js Koa Middleware for Compiling and Serving Sass 🎨

[Sass](https://sass-lang.com/) is the most mature, stable, and powerful professional grade CSS extension language in the world.

Why use `koa-sassy` to compile and serve your Sass :thinking:

- Lighting fast - complied files are cached in memory :rocket:
- Built-in [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) support :bookmark:
- Control the cache-control header :clock1:
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

## API :package:

### sassy(src, options) ⇒ `function`

serves cached sass as complied css

**Kind**: exported function  
**Returns**: `function` - middleware serving complied css

| Param | Type | Description |
| --- | --- | --- |
| src | `String` | path to sass directory |
| options | `Object` | koa-sassy options object |
| mount | `string` | mount point for css to be severed - default / |
| options.maxAge | `Number` | maximum time the favicon is considered fresh - default one day |
