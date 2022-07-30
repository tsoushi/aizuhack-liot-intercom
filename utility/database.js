import sqlite3 from 'sqlite3';
import * as fs from 'fs';

const DATABASE_PATH = 'database.sqlite3';


export const initDatabase = () => {
    const db = new sqlite3.Database(DATABASE_PATH);
    db.serialize(() => {
        const sqlQueries = fs.readFileSync('./schema.sql').toString().split(');');
        for (let sqlQuery of sqlQueries) {
            if (sqlQuery) {
                sqlQuery += ');';
                db.run(sqlQuery);
            }
        }
        db.close();
    });
}

export const addDeviceID = (userId, deviceId) => {
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
        const db = new sqlite3.Database(DATABASE_PATH);
        db.all("select * from users where device_id = ?", deviceId, (err, rows) => {
            db.close();
            const userIdList = [];
            for (const row of rows) {
                userIdList.push(row['user_id']);
            }
            resolve(userIdList);
        });
    });
}

// ユーザーIDに紐づいたdeviceIDを取得する
// 戻り値 : deviceID | null
export const getDeviceIDFromUserID = (userId) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DATABASE_PATH);
        db.get("select * from users where user_id = ?", userId, (err, row) => {
            db.close();
            if (row) { resolve(row['device_id']) }
            else { resolve(null) }
        });
    });
}

// 指定したuserIdのdeviceIdとの紐づけを削除する
export const removeDeviceIDByUserID = (userId) => {
    const db = new sqlite3.Database(DATABASE_PATH);
    db.run("delete from users where user_id = ?", [userId], () => {
        db.close();
    });
}

// 返信予約キューにテキストを追加する
export const addReplyMessage = (deviceId, replyText) => {
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
                db.run("delete from reply_message_queue where id = ?", row['id']);
                resolve(row['message']);
            }
            else { resolve(null) }
            db.close();
        });
    });
}