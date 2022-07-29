import line from '@line/bot-sdk';
import 'dotenv/config'; // このモジュールで.envから環境変数を設定する

const client = new line.Client({
    channelAccessToken: process.env.channelAccessToken,
});

export const pushMessage = (userId, message) => {
    return new Promise((resolve, reject) => {
        client.pushMessage(userId, message)
            .then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
    });
}

export const replyMessage = (token, message) => {
    return new Promise((resolve, reject) => {
        client.replyMessage(token, message)
            .then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
    });
}