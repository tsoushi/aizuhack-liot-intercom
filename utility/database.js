import * as mysql from 'mysql';
import * as fs from 'fs';
import { databaseLogger } from '../logger.js';

const DATABASE_PATH = 'database.sqlite3';

export const createConnection = (multipleStatements=false) => {
    let connection;
    connection = mysql.createConnection({
        multipleStatements: multipleStatements,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        socketPath: process.env.DB_SOCKET
    });
    databaseLogger.mark(connection);
    databaseLogger.mark(process.env.DB_SOCKET);
    connection.connect((err) => {
        databaseLogger.error(err);
    });
    return connection;
}

export const initDatabase = () => {
    databaseLogger.info('データベースを初期化中');
    const db = createConnection(true);
    db.query(fs.readFileSync('./schema.sql').toString('utf-8'), (err, results) => {
        if (err) throw err;
    });
    db.end();
    databaseLogger.info('データベースを初期化中 -> 完了');
}

export const addDeviceID = (userId, deviceId) => {
    databaseLogger.trace(`デバイスIDの追加 - userID: ${userId} - deviceID: ${deviceId}`)
    const db = createConnection();
    db.query('DELETE FROM users WHERE user_id = ?', [userId]);
    db.query("insert into users values(?,?)", [userId, deviceId]);
    db.end();
}

// デバイスIDに紐づいたuserIDをすべて取得する。
// 戻り値：userIDの配列
export const getUserIDsFromDeviceID = (deviceId) => {
    return new Promise((resolve, reject) => {
        databaseLogger.trace('デバイスIDからユーザーIDを取得');
        const db = createConnection();
        db.query("select * from users where device_id = ?", [deviceId], (err, rows) => {
            const userIdList = [];
            for (const row of rows) {
                userIdList.push(row['user_id']);
            }
            databaseLogger.trace('デバイスIDからユーザーIDを取得 -> 検索結果 '+userIdList.length+' users');
            resolve(userIdList);
        });
        db.end();
    });
}

// ユーザーIDに紐づいたdeviceIDを取得する
// 戻り値 : deviceID | null
export const getDeviceIDFromUserID = (userId) => {
    return new Promise((resolve, reject) => {
        databaseLogger.trace('ユーザーIDからデバイスIDを検索中')
        const db = createConnection();
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
        db.end();
    });
}

// 指定したuserIdのdeviceIdとの紐づけを削除する
export const removeDeviceIDByUserID = (userId) => {
    databaseLogger.trace(`userID[${userId}]のデバイス紐づけを削除`);
    const db = createConnection();
    db.query("delete from users where user_id = ?", [userId]);
    db.end();
}

// 返信予約キューにテキストを追加する
export const addReplyMessage = (deviceId, replyText) => {
    databaseLogger.trace(`返信予約キューに追加 - deviceID : ${deviceId} - message : ${replyText}`);
    const db = createConnection();
    db.query("insert into reply_message_queue(device_id, message) values(?,?)", [deviceId, replyText]);
    db.end();
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
    return new Promise((resolve, reject) => {
        const db = createConnection(true);
        db.query("select * from reply_message_queue where device_id = ?;delete from reply_message_queue where device_id = ?;", [deviceId, deviceId], (err, results) => {
            databaseLogger.warn(err);
            if (results[0][0]) {
                databaseLogger.trace('返信予約キューから取り出し - deviceID: '+deviceId)
                resolve(results[0][0]['message']);
            }
            else {
                databaseLogger.trace('返信予約キューから取り出し - メッセージなし - deviceID: '+deviceId)
                resolve(null);
            }
        });
        db.end();
    });
}