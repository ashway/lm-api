const Router = require('koa-router');
let sqlite = require('sqlite');
const dbPath = '../lm-api-data/db.sqlite';

let router = new Router();
router.get('/public/services/list', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT alias alias, group_concat(model, ',') models FROM services GROUP BY alias");
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

router.get('/public/services/list/:alias', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all(`SELECT cmk.name markName, cm.name modelName, cm.class class, cm.alias modelAlias, cc.alias alias, cc.photos photos, cc.cover cover, cm.price price  FROM services s 
        INNER JOIN carcatalog cc ON cc.model=s.model
        INNER JOIN carmodel cm ON cm.alias=cc.model
        INNER JOIN carmark cmk ON cmk.alias=cm.mark
        WHERE s.alias='${ctx.params.alias}'
        GROUP BY cc.model`);
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

module.exports = router.routes();