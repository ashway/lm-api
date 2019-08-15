const Router = require('koa-router');
let sqlite = require('sqlite');
const dbPath = '../lm-api-data/db.sqlite';

let router = new Router();
router.get('/public/mark/list', async function (ctx, next) {
    const db = await sqlite.open(dbPath);
    let rows = await db.all("SELECT * FROM carmark ORDER BY name");
    ctx.body = rows;
    ctx.status = 200;
    db.close();
});

module.exports = router.routes();