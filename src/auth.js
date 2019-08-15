const Router = require('koa-router');
let _ = require('lodash');
let router = new Router();
router.get('/auth/validate', async function (ctx, next) {
    ctx.body = { status: 'valid' };
    ctx.status = 200;
});

module.exports = router.routes();