const _ = require('koa-route')
const Koa = require('koa')
const app = new Koa()
const { getPolyfill, listPolyfills } = require('./middleware')
const LRU = require('quick-lru')
const cache = new LRU({ maxSize: 24 })

app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})
app.use(require('koa-compress')())
app.use(require('koa-cash')({
  hash: (ctx) => ctx.url + ctx.headers["user-agent"],
  get: (k) => cache.get(k),
  set: (k, v) => cache.set(k, v)
}))
app.use(_.get("/polyfill/v3/polyfill.(min.)?js", async (ctx) => {
  ctx.set("Cache-Control", "public, s-maxage=31536000, max-age=604800, stale-while-revalidate=604800, stale-if-error=604800")
  if (await ctx.cashed()) return
  await getPolyfill(ctx)
}))
app.use(_.get("/_/list", listPolyfills))

app.listen(8080)
