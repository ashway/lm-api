const Koa = require('koa');
const Router = require('koa-router');
const router = new Router();
let cors = require('koa2-cors');
const koaBody = require('koa-body');

const app = new Koa();

app.use(koaBody({ multipart: true }));
app.use(cors({ origin: '*' }));
app.use(router.allowedMethods());

app.use(require('./mark'));
app.use(require('./model'));
app.use(require('./catalog'));
 
app.listen(3033);
 
console.log('LM-API started and listening on port 3033.');