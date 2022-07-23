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
    
    fs.mkdirSync('public/image', {recursive: true});
    fs.writeFileSync(path, data);

    const url = 'https' + '://' + req.get( 'host' ) + '/static/image/' + fileName;
    return url;
}

