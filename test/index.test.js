/* eslint-env jest */
'use strict'

/* IMPORT TEST */
const sassy = require('..')

/* IMPORT MODULES */
const Koa = require('koa')
const supertest = require('supertest')
const fs = require('fs-extra')

beforeEach(() => {
  this.app = new Koa()
  this.request = supertest(this.app.callback())
})

describe('sassy()', () => {

  describe('arguments', () => {

    describe('src', () => {
      test('should throw error when null', async () => {
        expect(() => { this.app.use(sassy()) }).toThrow(new Error('[koa-sassy] src path is required'))
      })

      test('should throw error if src path does not exist', async () => {
        expect(() => { this.app.use(sassy('./invalid')) }).toThrow(new Error('[koa-sassy] src path must exist'))
      })

      test('should throw error if src path is file not directory', async () => {
        expect(() => { this.app.use(sassy('./test/assets/one.sass')) }).toThrow(new Error('[koa-sassy] src path must be directory not file'))
      })
    })

    describe('options.maxAge', () => {
  
      test('should set valid delta seconds', async () => {
        this.app.use(sassy('./test/assets', { maxAge: 200 }))
        const res = await this.request.get('/one.css')
        expect(res.header['cache-control']).toBe('public, max-age=200')
      })

      test('should default to one day', async () => {
        this.app.use(sassy('./test/assets', {}))
        const res = await this.request.get('/one.css')
        expect(res.header['cache-control']).toBe('public, max-age=86400')
      })

      test('should accept 0', async () => {
        this.app.use(sassy('./test/assets', { maxAge: 0 }))
        const res = await this.request.get('/one.css')
        expect(res.header['cache-control']).toBe('public, max-age=0')
      })

      test('should floor at 0', async () => {
        this.app.use(sassy('./test/assets', { maxAge: -100 }))
        const res = await this.request.get('/one.css')
        expect(res.header['cache-control']).toBe('public, max-age=0')
      })

      test('should ceil at 1 year', async () => {
        this.app.use(sassy('./test/assets', { maxAge: 999999999999 }))
        const res = await this.request.get('/one.css')
        expect(res.header['cache-control']).toBe('public, max-age=31536000')
      })

      test('should accept infinity ', async () => {
        this.app.use(sassy('./test/assets', { maxAge: Infinity }))
        const res = await this.request.get('/one.css')
        expect(res.header['cache-control']).toBe('public, max-age=31536000')
      })
    })

    describe('options.mount', () => {

      test('defult is /', async () => {
        this.app.use(sassy('./test/assets', {}))
        const res = await this.request.get('/one.css')
        expect(res.status).toBe(200)
      })

      test('should set valid mount point', async () => {
        this.app.use(sassy('./test/assets', { mount: '/stylesheet' }))
        const res = await this.request.get('/stylesheet/one.css')
        expect(res.status).toBe(200)
      })
    })
  })

  describe('requests', () => {

    test('GET / ', async () => {
      this.app.use(sassy('./test/assets'))
      const res = await this.request.get('/one.css')
      expect(res.status).toBe(200)
    })

    test('should serve css file with @/{filename}.css query string', async () => {
      this.app.use(sassy('./test/assets'))
      const res = await this.request.get('/one.css?v=1')
      expect(res.status).toBe(200)
    })

    test('should not serve css file !@/{filename}.css', async () => {
      this.app.use(sassy('./test/assets'))
      const res = await this.request.get('/')
      expect(res.status).not.toBe(200)
    })

    test('should include cache-control header', async () => {
      this.app.use(sassy('./test/assets'))
      const res = await this.request.get('/one.css')
      expect(res.status).toBe(200)
      expect(res.header['cache-control']).toBe('public, max-age=86400')
    })

    test('should include strong etag header', async () => {
      this.app.use(sassy('./test/assets'))
      const res = await this.request.get('/one.css')
      expect(res.status).toBe(200)
      expect(res.header.etag).not.toBe(null)
      expect(typeof res.header.etag).toBe('string')
    })

    test('should not accept POST requests', async () => {
      this.app.use(sassy('./test/assets'))
      const res = await this.request.post('/one.css')
      expect(res.status).toBe(405)
      expect(res.header.allow).toBe('GET, HEAD, OPTIONS')
    })

    test('should accept OPTIONS request', async () => {
      this.app.use(sassy('./test/assets'))
      const res = await this.request.options('/one.css')
      expect(res.status).toBe(200)
      expect(res.header.allow).toBe('GET, HEAD, OPTIONS')
    })

    test('should respond with 404 when file can not be found', async () => {
      this.app.use(sassy('./test/assets'))
      const res = await this.request.get('/main.css')
      expect(res.status).toBe(404)
    })

    test('should respond with 304 when If-None-Match header matches', async () => {
      this.app.use(sassy('./test/assets'))
      const res = await this.request.get('/one.css')
      expect(res.status).toBe(200)
      const res2 = await this.request.get('/one.css').set('If-None-Match', res.header.etag)
      expect(res2.status).toBe(304)
    })

    test('should update cashed file when sass file is modified', async () => {
      this.app.use(sassy('./test/assets'))
      const res = await this.request.get('/one.css')
      expect(res.status).toBe(200)
      const file = fs.readFileSync('./test/assets/one.sass')
      fs.writeFileSync('./test/assets/one.sass', file)
      const res2 = await this.request.get('/one.css')
      expect(res2.status).toBe(200)
    })

    test('should serve css file on mount', async () => {
      this.app.use(sassy('./test/assets', { mount: '/stylesheet' }))
      const res = await this.request.get('/stylesheet/one.css')
      expect(res.status).toBe(200)
      const res2 = await this.request.get('/one.css')
      expect(res2.status).toBe(404)
    })
  })
})
