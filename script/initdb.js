import * as database from '../utility/database.js';

console.log('データベースを作成します');
await database.initDatabase();
database.pool.end();