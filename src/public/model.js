const Router = require('koa-router');
let sqlite = require('sqlite');
const dbPath = '../lm-api-data/db.sqlite';

let router = new Router();

router.get('/public/model/list', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all(`SELECT 
            cm.alias,
            cm.class,
            cm.name modelName,
            cmk.name markName,
            cm.price,
            cm.outcity_price,
            cm.mintime,
            cm.is_group, 
            count(cc.rowid) as carCount 
        FROM carmodel cm 
        LEFT JOIN carcatalog cc ON cc.model=cm.alias 
        INNER JOIN carmark cmk ON cmk.alias=cm.mark
        GROUP BY cm.alias 
        ORDER BY cm.is_group, cm.mark, cm.name`);
    ctx.body = rows;
    ctx.status = 200;
    db.close();
    await next();
});

router.get('/public/model/${alias}', async function (ctx) {
    const db = await sqlite.open(dbPath);
        let rows = await db.get(`SELECT 
                cm.alias, 
                cm.class, 
                cm.name modelName, 
                cmk.name markName, 
                cm.price, 
                cm.outcity_price, 
                cm.mintime, 
            cm.is_group 
            FROM carmodel cm 
            INNER JOIN carmark cmk ON cmk.alias=cm.mark 
            WHERE cm.alias=$alias`, {  $alias: ctx.params.alias });
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

router.get('/public/class/price', async function (ctx) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT class, MIN(price) price FROM carmodel GROUP BY class");
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

router.get('/public/model/list/random', async function (ctx) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT carcatalog.alias, carcatalog.cover, carmodel.class, carmodel.alias modelAlias, carmark.name markName, carmodel.name modelName, carmodel.price, metamodel.is_group FROM carcatalog \n" +
        "INNER JOIN carmodel ON carmodel.alias=carcatalog.model \n" +
        "LEFT JOIN carmodel as metamodel ON metamodel.alias=carmodel.class\n" +
        "INNER JOIN carmark ON carmark.alias = carmodel.mark\n" +
        "GROUP BY carmodel.alias\n" +
        "ORDER BY RANDOM() LIMIT 10");
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

module.exports = router.routes();