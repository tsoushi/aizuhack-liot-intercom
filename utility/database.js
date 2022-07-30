import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import { databaseLogger } from '../logger.js';

const DATABASE_PATH = 'database.sqlite3';


export const initDatabase = () => {
    databaseLogger.info('データベースを初期化中');
    const db = new sqlite3.Database(DATABASE_PATH);
    db.serialize(() => {
        const sqlQueries = fs.readFileSync('./schema.sql').toString().split(');');
        for (let sqlQuery of sqlQueries) {
            if (sqlQuery) {
                sqlQuery += ');';
                db.run(sqlQuery);
            }
        }
        databaseLogger.info('データベースを初期化中 -> 完了');
        db.close();
    });
}

export const addDeviceID = (userId, deviceId) => {
    databaseLogger.trace(`デバイスIDの追加 - userID: ${userId} - deviceID: ${deviceId}`)
    const db = new sqlite3.Database(DATABASE_PATH);
    db.serialize(() => {
        db.run('DELETE FROM users WHERE user_id = ?', [userId]);
        db.run("insert into users values(?,?)", [userId, deviceId]);
        db.close();
    });
}

// デバイスIDに紐づいたuserIDをすべて取得する。
// 戻り値：userIDの配列
export const getUserIDsFromDeviceID = (deviceId) => {
    return new Promise((resolve, reject) => {
        databaseLogger.trace('デバイスIDからユーザーIDを取得');
        const db = new sqlite3.Database(DATABASE_PATH);
        db.all("select * from users where device_id = ?", deviceId, (err, rows) => {
            db.close();
            const userIdList = [];
            for (const row of rows) {
                userIdList.push(row['user_id']);
            }
            databaseLogger.trace('デバイスIDからユーザーIDを取得 -> 検索結果 '+userIdList.length+' users');
            resolve(userIdList);
        });
    });
}

// ユーザーIDに紐づいたdeviceIDを取得する
// 戻り値 : deviceID | null
export const getDeviceIDFromUserID = (userId) => {
    return new Promise((resolve, reject) => {
        databaseLogger.trace('ユーザーIDからデバイスIDを検索中')
        const db = new sqlite3.Database(DATABASE_PATH);
        db.get("select * from users where user_id = ?", userId, (err, row) => {
            db.close();
            if (row) {
                databaseLogger.trace('ユーザーIDからデバイスIDを検索中 -> 完了 : '+row['device_id']);
                resolve(row['device_id']);
            }
            else {
                databaseLogger.trace('ユーザーIDからデバイスIDを検索中 -> 完了 : 検索結果なし');
                resolve(null);
            }
        });
    });
}

// 指定したuserIdのdeviceIdとの紐づけを削除する
export const removeDeviceIDByUserID = (userId) => {
    databaseLogger.trace(`userID[${userId}]のデバイス紐づけを削除`);
    const db = new sqlite3.Database(DATABASE_PATH);
    db.run("delete from users where user_id = ?", [userId], () => {
        db.close();
    });
}

// 返信予約キューにテキストを追加する
export const addReplyMessage = (deviceId, replyText) => {
    databaseLogger.trace(`返信予約キューに追加 - deviceID : ${deviceId} - message : ${replyText}`);
    const db = new sqlite3.Database(DATABASE_PATH);
    db.run("insert into reply_message_queue(device_id, message) values(?,?)", [deviceId, replyText], () => {
        db.close();
    });
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
        const db = new sqlite3.Database(DATABASE_PATH);
        db.get("select * from reply_message_queue where device_id = ?", deviceId, (err, row) => {
            if (row) {
                databaseLogger.trace('返信予約キューから取り出し - deviceID: '+deviceId)
                db.run("delete from reply_message_queue where id = ?", row['id']);
                resolve(row['message']);
            }
            else {
                databaseLogger.trace('返信予約キューから取り出し - メッセージなし - deviceID: '+deviceId)
                resolve(null);
            }
            db.close();
        });
    });
}