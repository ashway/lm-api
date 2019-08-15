const Router = require('koa-router');
let sqlite = require('sqlite');
const dbPath = '../lm-api-data/db.sqlite';

let router = new Router();
router.get('/model/list', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT carmodel.*, count(carcatalog.rowid) as carCount FROM carmodel LEFT JOIN carcatalog ON carcatalog.model=carmodel.alias GROUP BY carmodel.alias ORDER BY carmodel.is_group, carmodel.mark, carmodel.name");
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

router.get('/model/delete/:alias', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    await db.all("DELETE FROM carmodel WHERE alias=$alias", {  $alias: ctx.params.alias });
    ctx.status = 200;
    db.close();
});

router.post(['/model/add', '/model/update/:alias'], async function (ctx, next) {
    let body = ctx.request.body;
    const db = await sqlite.open(dbPath);

    let data = {
        $alias: body.alias.toLowerCase().replace(/\s+/gi, ''),
        $class: body.class,
        $mark: body.mark,
        $name: body.name,
        $price: body.price,
        $outcity_price: body.outcity_price,
        $mintime: body.mintime,
        $seats: body.seats,
        $is_group: body.is_group
    };

    if(ctx.params.alias) {
        data.$aliasUpdate = ctx.params.alias;
        await db.all("UPDATE carmodel SET alias=$alias, class=$class, mark=$mark, name=$name, price=$price, outcity_price=$outcity_price, mintime=$mintime, seats=$seats, is_group=$is_group WHERE alias=$aliasUpdate",  data);
    } else {
        await db.all("INSERT INTO carmodel (alias, class, mark, name, price, outcity_price, mintime, seats, is_group) VALUES ($alias, $class, $mark, $name, $price, $outcity_price, $mintime, $seats, $is_group)", data);
    }

    ctx.status = 200;
    db.close();
});

module.exports = router.routes();