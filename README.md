> koa-polyfill

Middleware that provides a self-hosted version of polyfill.io

#### use

```js
const _ = require('koa-route')
const { getPolyfill } = require('koa-polyfill')
const Koa = require('koa')
const app = new Koa()
app.use(_.get("/polyfill/v3/polyfill.(min.)?js", async (ctx) => {
  await getPolyfill(ctx)
})
```

See index.js in this repo for a more complete example.
