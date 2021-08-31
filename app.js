const Koa = require('koa');
const path = require('path')
const fs = require('fs')
const router = require('koa-router')();
const static = require('koa-static')
const staticPath = './static'
const app = new Koa();
app.use(static(
    path.join(__dirname, staticPath)
))
// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    ctx.set('Cross-Origin-Opener-Policy', 'same-origin')
    ctx.set('Cross-Origin-Embedder-Policy', 'require-corp')
    await next();
});

router.get('/', async (ctx, next) => {
    ctx.response.body = '<h1>Index</h1>';
});
router.get('/:filename', async (ctx, next) => {
    console.log(ctx.request.url)
    const filePath = path.join(__dirname, ctx.request.url);
    console.log(filePath)
    const htmlContent = fs.readFileSync(filePath);
    ctx.type = "html";
    ctx.body = htmlContent;
});

app.use(router.routes());
app.listen(3000);
console.log('app started at port 3000...');