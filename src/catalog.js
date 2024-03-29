const Router = require('koa-router');
let sqlite = require('sqlite');
let _ = require('lodash');
const fs = require('fs');
const uuid = require('uuid/v1');
const pump = require('pump');
const dbPath = '../lm-api-data/db.sqlite';

let router = new Router();
router.get('/car/list/:model', async function (ctx, next) {
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

router.get('/car/list/:model/active', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT alias, model,price, outcity_price, mintime, photos, cover FROM carcatalog WHERE model='w222' AND active=1 ORDER BY active DESC, alias ASC", { $model: ctx.params.model });
    if(rows && _.isArray(rows) && rows.length==0) {
        rows = await db.all(`SELECT 
            cc.alias, 
            cc.photos, 
            cc.cover, 
            cc.model, 
            cm.name modelName, 
            cm.price, 
            cm.outcity_price, 
            cm.mintime, 
            cm.mark, 
            cmk.name markName 
        FROM carcatalog cc 
        INNER JOIN carmodel cm ON cm.alias=cc.model 
        INNER JOIN carmark cmk ON cmk.alias=cm.mark
        WHERE cm.class='premium' AND cc.active=1 
        ORDER BY cc.active DESC, cc.alias ASC`, { $class: ctx.params.model });
    }
    _.each(rows, r=>r.photos = ((r.photos||'').length>0)?r.photos.split(','):[]);
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

router.get('/car/get/:alias', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let row = await db.get("SELECT * FROM carcatalog WHERE alias=$alias", { $alias: ctx.params.alias });
    if(row) {
        row.photos = ((row.photos||'').length>0)?row.photos.split(','):[];
    }
    ctx.body = row || 0;
    ctx.status = 200;
    db.close();
});

router.get('/car/delete/:alias', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    await db.run("DELETE FROM carcatalog WHERE alias=$alias", { $alias: ctx.params.alias });
    ctx.status = 200;
    db.close();
});


router.get('/car/status/:alias/:status', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    await db.run("UPDATE carcatalog SET active=$status WHERE alias=$alias", { $alias: ctx.params.alias, $status: ctx.params.status });
    ctx.status = 200;
    db.close();
});

router.post(['/car/add', '/car/update/:alias'], async function (ctx, next) {
    let alias = ctx.params.alias || uuid();
    let body = ctx.request.body;
    let photos = (body.photos||'').length>0?body.photos.split(','):[];
    let files = ctx.request.files.files;

    if(!_.isArray(files) && files && files.type) {
        files = [files];
    }

    try {
        fs.statSync(`../lm-api-data/car/${alias}`);
    } catch(e) {
        fs.mkdirSync(`../lm-api-data/car/${alias}`);
    }

    if(files) {
        _.each(files, file=>{
            let filename=uuid();
            photos.push(filename);
            if(file.name==body.cover) {
                body.cover = filename;
            }
            pump(fs.createReadStream(file.path), fs.createWriteStream(`../lm-api-data/car/${alias}/${filename}.jpg`));
        });
        }

    if(!photos.length) body.cover = '';
    let data = {
        $alias: alias,
        $model: body.model,
        $driver: body.driver,
        $phone: body.phone,
        $price: body.price || '',
        $outcity_price: body.outcity_price || '',
        $mintime: body.mintime || '',
        $active: body.active || 0,
        $photos: photos.join(','),
        $cover: body.cover || photos[0]
    };
    const db = await sqlite.open(dbPath);
    await db.run('REPLACE INTO carcatalog (alias, model, driver, phone, price, outcity_price, mintime, active, photos, cover) VALUES($alias, $model, $driver, $phone, $price, $outcity_price, $mintime, $active, $photos, $cover)', data);
    db.close();
    ctx.body = alias;
    ctx.status = 200;
});

module.exports = router.routes();