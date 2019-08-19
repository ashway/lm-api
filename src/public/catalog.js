const Router = require('koa-router');
let sqlite = require('sqlite');
let _ = require('lodash');
const fs = require('fs');
const uuid = require('uuid/v1');
const pump = require('pump');
const dbPath = '../lm-api-data/db.sqlite';

let router = new Router();
router.get('/public/car/list/:model', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT * FROM carcatalog WHERE model=$model ORDER BY active DESC, alias ASC", { $model: ctx.params.model });
    if(rows && _.isArray(rows) && rows.length==0) {
        rows = await db.all("SELECT carcatalog.*, carmodel.price, carmodel.outcity_price, carmodel.mintime, carmodel.mark from carcatalog INNER JOIN carmodel ON carmodel.alias=carcatalog.model WHERE carmodel.class=$class ORDER BY carcatalog.active DESC, carcatalog.alias ASC", { $class: ctx.params.model });
    }
    _.each(rows, r=>r.photos = ((r.photos||'').length>0)?r.photos.split(','):[]);
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

router.get('/public/car/list/:model/active', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT alias, model, price, outcity_price, mintime, photos, cover FROM carcatalog WHERE model=$model AND active=1 ORDER BY active DESC, alias ASC", { $model: ctx.params.model });
    if(rows && _.isArray(rows) && rows.length==0) {
        rows = await db.all(`SELECT 
            cc.alias, 
            cc.photos, 
            cc.cover, 
            cc.model, 
            cm.name modelName,
            coalesce(NULLIF(cc.price,''), NULLIF(cm.price,'')) price, 
            coalesce(NULLIF(cc.outcity_price,''), NULLIF(cm.outcity_price,'')) outcity_price, 
            coalesce(NULLIF(cc.mintime,''), NULLIF(cm.mintime,'')) mintime, 
            cm.seats seats, 
            cm.mark, 
            cmk.name markName 
        FROM carcatalog cc 
        INNER JOIN carmodel cm ON cm.alias=cc.model 
        INNER JOIN carmark cmk ON cmk.alias=cm.mark
        WHERE cm.class=$class AND cc.active=1 
        ORDER BY cc.active DESC, cc.alias ASC`, { $class: ctx.params.model });
    }
    _.each(rows, r=>r.photos = ((r.photos||'').length>0)?r.photos.split(','):[]);
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

router.get('/public/car/get/:alias', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let row = await db.get("SELECT * FROM carcatalog WHERE alias=$alias", { $alias: ctx.params.alias });
    if(row) {
        row.photos = ((row.photos||'').length>0)?row.photos.split(','):[];
    }
    ctx.body = row || 0;
    ctx.status = 200;
    db.close();
});

router.get('/public/car/status/:alias/:status', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    await db.run("UPDATE carcatalog SET active=$status WHERE alias=$alias", { $alias: ctx.params.alias, $status: ctx.params.status });
    ctx.status = 200;
    db.close();
});

module.exports = router.routes();