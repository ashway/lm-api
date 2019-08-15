const Router = require('koa-router');
let _ = require('lodash');
let router = new Router();
const jwt = require('jsonwebtoken');

router.post('/auth', async function (ctx, next) {
    let body = ctx.request.body;
    if(body.login=='luxmotor' && body.password==process.env.PASSWORD) {
        ctx.body = jwt.sign('valid', process.env.SECRET);
    } else {
        ctx.body = { error: 'noauth' }
    }
    ctx.status = 200;
});

module.exports = router.routes();