const Router = require('koa-router');
let sqlite = require('sqlite');
const dbPath = '../lm-api-data/db.sqlite';

let router = new Router();
router.get('/services/list', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT * FROM services ORDER BY rowid");
    ctx.body = rows;
    ctx.status = 200;
    db.close();
    await next();
});

router.post('/services/save/:alias', async function (ctx, next) {
    let body = ctx.request.body;
    const db = await sqlite.open(dbPath);
    await db.run("UPDATE services SET models=$models WHERE alias=$alias", {  $alias: ctx.params.alias, $models: body.models.join(',') });
    ctx.status = 200;
    db.close();
    await next();
});



module.exports = router.routes();