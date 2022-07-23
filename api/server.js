// 外部モジュールの読み込み
import line from '@line/bot-sdk';
import express from 'express';
import { middleware } from '@line/bot-sdk';
import 'dotenv/config'; // このモジュールで.envから環境変数を設定する

// ファイルの読み込み
import { index } from '../linebot/bot.js';

import * as utility from '../utility.js';


// 初期処理
const PORT = process.env.PORT || 3000;
const app = express();

const client = new line.Client({
    channelAccessToken: process.env.channelAccessToken,
});

// public ディレクトリを公開する
app.use('/static', express.static('public'));

// /にアクセスがあった時、Deploy succeededと返す
app.get('/', (req, res) => { res.send('Deploy succeeded'); });

// /webhookにアクセスがあったとき、bot.jsのindexを呼び出す
app.post('/webhook', middleware({
    channelSecret: process.env.channelSecret,
}), index);

app.post('/intercom/notice', express.json(),(req, res) => {
    // IoTから送られてきたデータを整理して、LINEのテキストとしてPUSHメッセージを送る
    const message = utility.makeTextMessage(`${req.body.datetime}\n訪問者が来ました`);
    client.pushMessage(process.env.userId, message);
    res.send("ok");
});


app.post('/intercom/text',express.json(),(req, res) => {
    // IoTから送られてきた音声のテキストをLINEのテキストとしてPUSHメッセージを送る
    const message = utility.makeTextMessage(`訪問者からのメッセージ:\n${req.body.text}`);
    client.pushMessage(process.env.userId, message);
    res.send("ok");
})

// 訪問者の写真が送られてくる
app.post('/intercom/image', express.json({limit: '10mb'}), (req, res) => {
    const data = Buffer.from(req.body.data, 'base64');
    utility.genImageUrlFromBytes(data, req)
        .then((imageUrl) => {
            const message = utility.makeVisitorsImageMessage(imageUrl);
            client.pushMessage(process.env.userId, message);
        });

    res.send('ok');
});


app.listen(PORT); // サーバーを起動する
console.log(`Server running at ${PORT}`);