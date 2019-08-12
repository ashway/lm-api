const Koa = require('koa');
const Router = require('koa-router');
const router = new Router();
let cors = require('koa-cors');
const koaBody = require('koa-body');
const serve = require('koa-static');

const app = new Koa();

app.use(serve(`${__dirname}/static`));
app.use(koaBody({ multipart: true }));
app.use(cors({ origin: false } ));
app.use(router.allowedMethods());

app.use(require('./mark'));
app.use(require('./model'));
app.use(require('./catalog'));
 
app.listen(3033);
 
console.log('LM-API started and listening on port 3033.');