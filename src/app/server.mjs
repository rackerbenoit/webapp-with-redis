import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';

import { client, initialConnect } from '../lib/redisConnection.mjs';

let connectionErr = false;
let connectionErrMsg;
client.on('error', (err) => {
  if (initialConnect) {
    connectionErr = true;
    connectionErrMsg = err;
  }
});

const TITLE = 'Node.js + Redis on Northflank - PR Hello';

const handleIndex = async (ctx, next) => {
  if (connectionErr && initialConnect) {
    ctx.throw(400, `Connection failed to database: ${connectionErrMsg}`);
  } else if (!initialConnect) {
    ctx.throw(400, `Not connected yet`);
  }

  const entries = await client.lrange('films', 0, 100);
  const entryCount = await client.llen('films');

  ctx.body = `
<html lang="en">
    <head>
        <title>${TITLE}</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="xl:w-1/2 p-12 mx-auto">
        <header class="mb-10">
            <h1 class="text-xl font-semibold mb-5">${TITLE}</h1>
            <form action="/add" method="POST" class="flex">
                <input type="text" name="title" class="w-full border-solid border-2 border-black px-3 py-2 mr-1" />
                <button class="whitespace-nowrap text-white bg-blue-500 border-solid border-2 border-blue-500 px-3 py-2 mr-1">Add entry</button>
                <a href="/delete" >
                    <button type="button" class="whitespace-nowrap text-white bg-red-500 border-solid border-2 border-red-500 px-3 py-2">Delete all</button>
                </a>
            </form>
        </header>
        <div class="italic mb-5">Total number of entries: ${entryCount}</div>
        <div>
            <ul>
                ${entries
                  .map(
                    (e) => `<li class="border-t-solid border-t-2 border-black-500 p-5">${e}</li>`
                  )
                  .join('')}
            </ul>
        </div>
    </body>
</html>
`;

  next();
};

const handleAdd = (ctx, next) => {
  const { title } = ctx.request.body;
  client.lpush(['films', title]);
  ctx.redirect('/');
  next();
};

const handleDelete = (ctx, next) => {
  client.del('films');
  ctx.redirect('/');
  next();
};

export default () => {
  const app = new Koa();
  const router = new Router();

  app.use(bodyParser());

  app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
  });

  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  });

  router.get('/', handleIndex);
  router.post('/add', handleAdd);
  router.get('/delete', handleDelete);

  app.use(router.routes());

  const port = 3000;
  app.listen(port);
  console.log('listening on http://localhost:' + port);
};
