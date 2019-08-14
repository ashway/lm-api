const Router = require('koa-router');
let sqlite = require('sqlite');
const dbPath = '../lm-api-data/db.sqlite';

let router = new Router();
router.get('/services/list', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT alias alias, group_concat(model, ',') models FROM services GROUP BY alias");
    ctx.body = rows;
    ctx.status = 200;
    db.close();
    await next();
});


//SELECT * FROM services s LEFT JOIN carcatalog cc ON cc.model IN (s.models||',') WHERE s.alias='premium'

router.get('/services/list/:alias', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT * FROM services");
    ctx.body = rows;
    ctx.status = 200;
    db.close();
    await next();
});

router.get('/services/add/:alias/:model', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    await db.run("INSERT INTO services (alias, model) VALUES($alias, $model)", {  $alias: ctx.params.alias, $model: ctx.params.model });
    ctx.status = 200;
    db.close();
    await next();
});

router.get('/services/delete/:alias/:model', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    await db.run("DELETE FROM services WHERE alias=$alias AND $model=$model", {  $alias: ctx.params.alias, $model: ctx.params.model });
    ctx.status = 200;
    db.close();
    await next();
});


module.exports = router.routes();