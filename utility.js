import * as fs from 'fs';

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
    dt.j
    return '' + dt.getFullYear() + dt.getMonth() + dt.getDate() 
    + dt.getHours() + dt.getMinutes() + dt.getSeconds() + dt.getMilliseconds()
    + '.' + ext;
}

// 画像データを保存して画像へのURLをリターンする（非同期）
export const genImageUrlFromBytes = async (data, req) => {
    const fileName = genFileNameFromDatetime('jpg');
    const path = 'public/image/' + fileName;
    
    fs.mkdir('public/image', {recursive: true}, (err) => {
        console.error('ディレクトリの作成に失敗: ', err);
    });
    fs.writeFileSync(path, data);

    const url = 'https' + '://' + req.get( 'host' ) + '/static/image/' + fileName;
    return url;
}

export const addDeviceID = (user_id, device_id) => {
const db = new sqlite3.Datebase(DATABASE_PATH);

db.run("insert into users values(?,?)", user_id, device_id);

}


export const getUserIdFromDeviceID = (device_id) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Datebase(DATABASE_PATH);
        db.get("select * from users where device_id = ?", device_id, (err, row) => {
            resolve(row["user_id"]);
        });
    });
}


