import * as fs from 'fs';
import { systemLogger } from '../logger.js';

// 日時からファイル名を生成する
export const genFileNameFromDatetime = (ext, date=Date.now()) => {
    const dt = new Date(date);
    return dt.toISOString().replace(/[\-T:\.]/g, '_').replace('Z', '') + '.' + ext;
}

// 画像データを保存して画像へのURLをリターンする（非同期）
export const genImageUrlFromBytes = async (data, req) => {
    systemLogger.trace('画像データからURLを生成')
    const fileName = genFileNameFromDatetime('jpg');
    const path = 'public/image/' + fileName;
    
    fs.mkdirSync('public/image', {recursive: true});
    fs.writeFileSync(path, data);

    const url = req.protocol + '://' + req.get( 'host' ) + '/static/image/' + fileName;
    systemLogger.trace('画像データからURLを生成 -> 完了 url: '+url);
    return url;
}