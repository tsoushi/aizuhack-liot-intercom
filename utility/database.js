import * as mysql from 'mysql';
import * as fs from 'fs';
import { databaseLogger } from '../logger.js';
import 'dotenv/config'; // このモジュールで.envから環境変数を設定する

import * as func from './func.js';

const DATABASE_PATH = 'database.sqlite3';

export const pool = mysql.createPool({
    multipleStatements: true,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    socketPath: process.env.DB_SOCKET
});

export const createConnection = (multipleStatements=false) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) databaseLogger.error(err);
            resolve(connection);
        });
    });
}

export const initDatabase = async () => {
    databaseLogger.info('データベースを初期化中');
    const db = await createConnection(true);
    db.query(fs.readFileSync('./schema.sql').toString('utf-8'), (err, results) => {
        if (err) throw err;
    });
    db.release();
    databaseLogger.info('データベースを初期化中 -> 完了');
}

export const addDeviceID = async (userId, deviceId) => {
    databaseLogger.trace(`デバイスIDの追加 - userID: ${userId} - deviceID: ${deviceId}`)
    const db = await createConnection();
    db.query('DELETE FROM users WHERE user_id = ?', [userId]);
    db.query("insert into users values(?,?)", [userId, deviceId]);
    db.release();
}

// デバイスIDに紐づいたuserIDをすべて取得する。
// 戻り値：userIDの配列
export const getUserIDsFromDeviceID = (deviceId) => {
    return new Promise(async (resolve, reject) => {
        databaseLogger.trace('デバイスIDからユーザーIDを取得');
        const db = await createConnection();
        db.query("select * from users where device_id = ?", [deviceId], (err, rows) => {
            const userIdList = [];
            for (const row of rows) {
                userIdList.push(row['user_id']);
            }
            databaseLogger.trace('デバイスIDからユーザーIDを取得 -> 検索結果 '+userIdList.length+' users');
            resolve(userIdList);
        });
        db.release();
    });
}

// ユーザーIDに紐づいたdeviceIDを取得する
// 戻り値 : deviceID | null
export const getDeviceIDFromUserID = (userId) => {
    return new Promise(async (resolve, reject) => {
        databaseLogger.trace('ユーザーIDからデバイスIDを検索中')
        const db = await createConnection();
        db.query("select * from users where user_id = ?", [userId], (err, rows) => {
            if (rows[0]) {
                databaseLogger.trace('ユーザーIDからデバイスIDを検索中 -> 完了 : '+rows[0]['device_id']);
                resolve(rows[0]['device_id']);
            }
            else {
                databaseLogger.trace('ユーザーIDからデバイスIDを検索中 -> 完了 : 検索結果なし');
                resolve(null);
            }
        });
        db.release();
    });
}

// 指定したuserIdのdeviceIdとの紐づけを削除する
export const removeDeviceIDByUserID = async (userId) => {
    databaseLogger.trace(`userID[${userId}]のデバイス紐づけを削除`);
    const db = await createConnection();
    db.query("delete from users where user_id = ?", [userId]);
    db.release();
}

// 返信予約キューにテキストを追加する
export const addReplyMessage = async (deviceId, replyText) => {
    databaseLogger.trace(`返信予約キューに追加 - deviceID : ${deviceId} - message : ${replyText}`);
    const db = await createConnection();
    db.query("insert into reply_message_queue(device_id, message) values(?,?)", [deviceId, replyText]);
    db.release();
}

// userIDからデバイスIDを取得して、返信予約キューにテキストを追加する
// 戻り値：Promise
// デバイスIDが見つからなかった場合、rejectされる
export const addReplyMessageByUserId = (userId, replyText) => {
    return new Promise(async (resolve, reject) => {
        const deviceId = await getDeviceIDFromUserID(userId);
        if (deviceId === null) reject();
        else {
            addReplyMessage(deviceId, replyText);
            resolve();
        }
    });
}

// 返信予約キューから一つ取り出す
export const getReplyMessage = (deviceId) => {
    return new Promise(async (resolve, reject) => {
        const db = await createConnection(true);
        db.query("select * from reply_message_queue where device_id = ?;", [deviceId, deviceId], (err, result) => {
            if (result[0]) {
                db.query('delete from reply_message_queue where id = ?;', [result[0]['id']]);
                databaseLogger.trace('返信予約キューから取り出し - deviceID: '+deviceId)
                resolve(result[0]['message']);
            }
            else {
                databaseLogger.trace('返信予約キューから取り出し - メッセージなし - deviceID: '+deviceId)
                resolve(null);
            }
        });
        db.release();
    });
}

// 文脈を登録する
// 引数: (ユーザーID, 文脈名)
export const setContext = async (userId, context) => {
    const db = await createConnection();
    db.query('INSERT INTO context(user_id, context) VALUES(?, ?);', [userId, context], (err, result) => {
        if (err) throw err;
    });
    db.release();
}

// 文脈を取得する
// 引数: (ユーザーID)
// 戻り値: 文脈名 | null
export const getContext = (userId) => {
    return new Promise(async (resolve, reject) => {
        const db = await createConnection();
        db.query('SELECT user_id, context FROM context WHERE user_id = ?;', [userId], (err, result) => {
            if (err) reject(err);
            if (result[0]) {
                resolve(result[0]['context']);
            } else {
                resolve(null);
            }
        });
        db.release();
    });
}

// 文脈を削除する
// 引数: (文脈名)
export const deleteContext = async (userId) => {
    const db = await createConnection();
    db.query('DELETE FROM context WHERE user_id = ?;', [userId], (err, result) => {
        if (err) throw err;
    });
    db.release();
}

// ログに訪問者の画像を追加する
export const addVisitorImageLog = async (deviceId, datetime, imageUrl) => {
    databaseLogger.trace(`訪問者の画像をログに追加 - id: ${deviceId} datetime: ${datetime} url: ${imageUrl}`)
    const db = await createConnection();
    db.query('INSERT INTO visitor_images(device_id, created_at, image_url) VALUES(?, ?, ?);', [deviceId, func.dateToDatabaseDate(datetime), imageUrl], (err, result) => {
        if (err) throw err;
    });
    db.release();
}

// 訪問者の画像のログを取得する
export const getVisitorImageLog = (deviceId, limit=5) => {
    return new Promise(async (resolve, reject) => {
        databaseLogger.trace('訪問者の画像のログの取得')
        const db = await createConnection();
        db.query('SELECT device_id, created_at, image_url FROM visitor_images WHERE device_id = ? ORDER BY created_at DESC LIMIT ?;', [deviceId, limit], (err, rows) => {
            if (err) throw err;
            const ret = [];
            for (const row of rows) {
                ret.push({
                    deviceId: row['device_id'],
                    datetime: new Date(row['created_at']),
                    imageUrl: row['image_url']
                });
            }
            databaseLogger.trace('訪問者の画像のログの取得 -> 完了: ' + ret.length + ' 件');
            resolve(ret);
        });
        db.release();
    });
}

export const removeVisitorImageLogByUrl = async (imageUrl) => {
    databaseLogger.trace(`訪問者の画像のログを削除 - url: ${imageUrl}`)
    const db = await createConnection();
    db.query('DELETE FROM visitor_images WHERE image_url = ?;', [imageUrl], (err, result) => {
        if (err) throw err;
    });
    db.release();
}