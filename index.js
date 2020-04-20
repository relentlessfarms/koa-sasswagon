'use strict'

/* MODULE DEPENDENCIES */
const sass = require('node-sass')
const fs = require('fs-extra')
const etag = require('etag')
const path = require('path')

/* MODULE VARIABLES */
const ONE_YEAR_MS = 60 * 60 * 24 * 365 // one year in seconds
const ONE_DAY_MS = 60 * 60 * 24 // one day in seconds

/**
 * serves cached sass as complied css
 * @param {String} src path to sass directory
 * @param {Object} options koa-sassy options object
 * @param {Object} options.mount mount point for css to be severed - default /
 * @param {Number} options.maxAge maximum time the favicon is considered fresh - default one day
 * @returns {Function} middleware serving complied css
 */
function middleware (src, options) {
  if (!src) throw new Error('[koa-sassy] src path is required')
  if (!fs.existsSync(src)) throw new Error('[koa-sassy] src path must exist')
  if (!fs.statSync(src).isDirectory()) throw new Error('[koa-sassy] src path must be directory not file')

  options = options || {}
  options.mount = options.mount == null ? '' : options.mount
  options.maxAge = options.maxAge == null ? ONE_DAY_MS : Math.min(Math.max(0, options.maxAge), ONE_YEAR_MS)

  const sassFiles = fs.readdirSync(src)
    .filter(fileName => fileName.endsWith('.sass'))
    .map(fileName => path.resolve(src, fileName))
    .map(filePath => {
      return {
        path: filePath,
        name: path.basename(filePath).slice(0, -5),
        css: sass.renderSync({ file: filePath }).css,
        mtimeMs: fs.statSync(filePath).mtimeMs
      }
    })

  return (ctx, next) => {
    const regex = new RegExp(`^${options.mount}/[^/<>\\^%]*.css$`)
    if (!regex.test(ctx.path)) return next()
    if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
      ctx.status = ctx.method === 'OPTIONS' ? 200 : 405
      ctx.set('Allow', 'GET, HEAD, OPTIONS')
    } else {
      const cssName = path.basename(ctx.path, '.css')
      const sassNames = sassFiles.map(sassFile => { return sassFile.name })
      const casheIndex = sassNames.indexOf(cssName)
      if (casheIndex < 0) {
        ctx.status = 404
        return
      }
      const sassFile = sassFiles[casheIndex]
      const mtimeMs = fs.statSync(sassFile.path).mtimeMs
      if (sassFile.mtimeMs < mtimeMs) {
        sassFiles[casheIndex].css = sass.renderSync({ file: sassFiles[casheIndex].path }).css
        sassFiles[casheIndex].mtimeMs = mtimeMs
      }
      ctx.set('Cache-Control', `public, max-age=${options.maxAge}`)
      ctx.type = 'text/css;charset=utf-8'
      ctx.status = 200
      ctx.set('ETag', etag(sassFile.css))
      if (ctx.fresh) {
        ctx.status = 304
        return
      }
      ctx.body = sassFile.css
      return ctx
    }
  }
}

module.exports = middleware
