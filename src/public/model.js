const Router = require('koa-router');
let sqlite = require('sqlite');
const dbPath = '../lm-api-data/db.sqlite';

let router = new Router();
router.get('/public/model/list', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT carmodel.*, count(carcatalog.rowid) as carCount FROM carmodel LEFT JOIN carcatalog ON carcatalog.model=carmodel.alias GROUP BY carmodel.alias ORDER BY carmodel.is_group, carmodel.mark, carmodel.name");
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

router.get('/public/class/price', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT class, MIN(price) price FROM carmodel GROUP BY class");
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

router.get('/public/model/list/random', async function (ctx, next) {
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