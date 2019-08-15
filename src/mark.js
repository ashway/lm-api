const Router = require('koa-router');
let sqlite = require('sqlite');
const dbPath = '../lm-api-data/db.sqlite';

let router = new Router();
router.get('/mark/list', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT * FROM carmark ORDER BY name");
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

router.get('/mark/delete/:alias', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    await db.run("DELETE FROM carmark WHERE alias=$alias", {  $alias: ctx.params.alias });
    ctx.status = 200;
    db.close();
});

router.post('/mark/add', async function (ctx, next) {
    let body = ctx.request.body;
    const db = await sqlite.open(dbPath);
    body.alias = body.alias.toLowerCase().replace(/\s+/gi, '');
    await db.run("INSERT INTO carmark (alias, name) VALUES ($alias, $name)", { $alias: body.alias, $name: body.name });
    ctx.status = 200;
    db.close();
});

module.exports = router.routes();