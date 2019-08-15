const Koa = require('koa');
const Router = require('koa-router');
const router = new Router();
let cors = require('koa2-cors');
const koaBody = require('koa-body');
let jwt = require('koa-jwt');
const jsonwebtoken = require('jsonwebtoken');
const app = new Koa();

app.use(koaBody({ multipart: true }));
app.use(cors({ origin: false }));
app.use(router.allowedMethods());

app.use(require('./public/auth'));
app.use(require('./public/mark'));
app.use(require('./public/model'));
app.use(require('./public/catalog'));
app.use(require('./public/services'));

app.use(jwt({ secret: process.env.SECRET }));

app.use(require('./auth'));
app.use(require('./mark'));
app.use(require('./model'));
app.use(require('./catalog'));
app.use(require('./services'));


app.listen(3033);
 
console.log('LM-API started and listening on port 3033.');