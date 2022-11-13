// 外部モジュールの読み込み
import express from 'express';
import { middleware } from '@line/bot-sdk';
import 'dotenv/config'; // このモジュールで.envから環境変数を設定する
import log4js from 'log4js';


// ファイルの読み込み
import { logger, accessLogger, systemLogger } from '../logger.js';
import { index } from '../linebot/bot.js';
import { utility } from '../utility.js';


// 初期処理
const PORT = process.env.PORT || 3000;
const app = express();

// サーバーの初期設定
app.enable('trust proxy'); // X-Forwarde-Protoヘッダを信頼する

// アクセスログの設定
app.use((req, res, next) => {
    accessLogger.info(`${req.method} ${req.url}`);
    next();
});
app.use(log4js.connectLogger(accessLogger, {format: ':method :url -> :status'}));

// public ディレクトリを公開する
app.use('/static', express.static('public'));

// /にアクセスがあった時、Deploy succeededと返す
app.get('/', (req, res) => { res.send('Deploy succeeded'); });

// /webhookにアクセスがあったとき、bot.jsのindexを呼び出す
app.post('/webhook', middleware({
    channelSecret: process.env.channelSecret,
}), index);

app.post('/intercom/notice', express.json(), (req, res) => {
    // IoTから送られてきたデータを整理して、LINEのテキストとしてPUSHメッセージを送る
    const message = utility.makeMessage.text(`${utility.func.dateToLocaleString(new Date(req.body.datetime))}\n訪問者が来ました`);
    utility.database.getUserIDsFromDeviceID(req.body.id).then((userIds) => {
        utility.lineClient.multicast(userIds, message).catch(() => {});
    })
    res.send("ok");
});


app.post('/intercom/text',express.json(),(req, res) => {
    // IoTから送られてきた音声のテキストをLINEのテキストとしてPUSHメッセージを送る
    const message = utility.makeMessage.text(`${utility.func.dateToLocaleString(new Date(req.body.datetime))}\n訪問者からのメッセージ:\n${req.body.text}`);
    utility.database.getUserIDsFromDeviceID(req.body.id).then((userIds) => {
        utility.lineClient.multicast(userIds, message).catch(()=>{});
    })
    res.send("ok");
});

// 訪問者の写真が送られてくる
app.post('/intercom/image', express.json({limit: '10mb'}), (req, res) => {
    const data = Buffer.from(req.body.data, 'base64');
    utility.func.genImageUrlFromBytes(data, req)
        .then((imageUrl) => {
            utility.database.addVisitorImageLog(req.body.id, new Date(req.body.datetime), imageUrl, req.body.name);
            const message = utility.makeMessage.visitorsImage(imageUrl, utility.func.dateToLocaleString(new Date(req.body.datetime)), req.body.name);
            utility.database.getUserIDsFromDeviceID(req.body.id).then((userIds) => {
                utility.lineClient.multicast(userIds, message).catch(() => {});
            })
        });

    res.send('ok');
});

app.get('/intercom/get-message', async (req, res) => {
    // Iotからの返信メッセージの要求
    const replyMessage = await utility.database.getReplyMessage(req.query.id);
    if (replyMessage === null) res.json({exist: false});
    else {
        systemLogger.debug(`IoT側への返信メッセージ - deviceID: ${req.query.id} - message: ${replyMessage}`)
        res.json({
            exist: true,
            text: replyMessage
        });
    }
});

// IoTからの顔認識用写真の要求
// パスパラメータ: id=[デバイスID]
// レスポンス
// {
//     exist: [true | false],
//     url: [顔写真へのURL](existがtrueのときのみ)
// }
app.get('/intercom/recog-image-url', async (req, res) => {
    const data = await utility.database.popFaceRecogImageQueue(req.query.id);
    if (data === null) res.json({exist: false});
    else {
        systemLogger.debug(`IoT側へ顔認識用写真の登録 - deviceID: ${req.query.id} - url: ${data['image_url']}`);
        res.json({
            exist: true,
            url: data['image_url'],
            name: data['name']
        });
    }
});

app.listen(PORT); // サーバーを起動する
logger.info(`Server running at ${PORT}`);