import line from '@line/bot-sdk';
import 'dotenv/config'; // このモジュールで.envから環境変数を設定する
import { lineLogger } from '../logger.js';

const client = new line.Client({
    channelAccessToken: process.env.channelAccessToken,
});

export const pushMessage = (userId, message) => {
    return new Promise((resolve, reject) => {
        client.pushMessage(userId, message)
            .then(() => {
                lineLogger.debug('pushMessage -> 成功 - to: ' + userId);
                resolve();
            }).catch((err) => {
                lineLogger.warn('pushMessage -> 失敗 - to: ' + userId);
                reject(err);
            });
    });
}

export const replyMessage = (token, message) => {
    return new Promise((resolve, reject) => {
        client.replyMessage(token, message)
            .then(() => {
                lineLogger.debug('replyMessage -> 成功');
                resolve();
            }).catch((err) => {
                lineLogger.debug('replyMessage -> 失敗');
                reject(err);
            });
    });
}