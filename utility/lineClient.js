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
                lineLogger.warn('pushMessage -> 失敗 - ' + err.originalError.response.data.message);
                const details = err.originalError.response.data.details;
                for (const detail of details) {
                    lineLogger.warn(`${detail.message} : ${detail.property}`)
                }
                reject(err);
            });
    });
}

// 複数のユーザー宛にメッセージを送信する
// userId は配列で指定。空配列でも可。
// 戻り値: bool
// １人以上に送信できた場合はtrue。userIdsが空の場合はfalse。
export const multicast = (userIds, message) => {
    return new Promise((resolve, reject) => {
        if (userIds.length) {
            client.multicast(userIds, message)
                .then(() => {
                    lineLogger.debug('multicast -> 成功 - to: ' + userIds);
                    resolve(true);
                }).catch((err) => {
                    lineLogger.warn('multicast -> 失敗 - ' + err.originalError.response.data.message);
                    const details = err.originalError.response.data.details;
                    for (const detail of details) {
                        lineLogger.warn(`${detail.message} : ${detail.property}`)
                    }
                    reject(err);
                });
        } else {
            lineLogger.debug('multicast -> 送信先なし');
            resolve(false);
        }
    });
}

export const replyMessage = (token, message) => {
    return new Promise((resolve, reject) => {
        client.replyMessage(token, message)
            .then(() => {
                lineLogger.debug('replyMessage -> 成功');
                resolve();
            }).catch((err) => {
                lineLogger.warn('replyMessage -> 失敗 - ' + err.originalError.response.data.message);
                const details = err.originalError.response.data.details;
                for (const detail of details) {
                    lineLogger.warn(`${detail.message} : ${detail.property}`)
                }
                reject(err);
            });
    });
}