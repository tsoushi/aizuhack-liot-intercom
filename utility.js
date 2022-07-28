import * as fs from 'fs';
import sqlite3 from 'sqlite3';

const DATABASE_PATH = 'database.sqlite3';

export const makeTextMessage = (text) => {
    return {
        type: "text",
        text: text
    }
}

// 訪問者の写真ビュー用のメッセージを生成する
export const makeVisitorsImageMessage = (imageUrl) => {
    return {
        type: 'flex',
        altText: 'This is a Flex Message',
        contents: {
            type: "bubble",
            hero: {
                type: "image",
                url: imageUrl,
                size: "full",
                aspectMode: "fit"
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: []
            }
        }
    }
}

// 日時からファイル名を生成する
export const genFileNameFromDatetime = (ext, date=Date.now()) => {
    const dt = new Date(date);
    return dt.toISOString().replace(/[\-T:\.]/g, '_').replace('Z', '') + '.' + ext;
}

// 画像データを保存して画像へのURLをリターンする（非同期）
export const genImageUrlFromBytes = async (data, req) => {
    const fileName = genFileNameFromDatetime('jpg');
    const path = 'public/image/' + fileName;
    
    fs.mkdirSync('public/image', {recursive: true});
    fs.writeFileSync(path, data);

    const url = 'https' + '://' + req.get( 'host' ) + '/static/image/' + fileName;
    return url;
}

export const initDatabase = () => {
    const db = new sqlite3.Database(DATABASE_PATH);
    const sqlQuery = fs.readFileSync('./schema.sql');
    db.run(sqlQuery.toString(), () => {
        db.close();
    });
}

export const addDeviceID = (userId, deviceId) => {
    const db = new sqlite3.Database(DATABASE_PATH);
    db.run("insert into users values(?,?)", [userId, deviceId], () => {
        db.close();
    });
}

export const getUserIdFromDeviceID = (deviceId) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DATABASE_PATH);
        db.get("select * from users where device_id = ?", deviceId, (err, row) => {
            resolve(row["user_id"]);
            db.close();
        });
    });
}