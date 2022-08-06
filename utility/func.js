import * as fs from 'fs';
import { systemLogger } from '../logger.js';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({keyFilename: 'key.json'});
const bucketName = 'liot-intercom'

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

// gcsに画像をアップロード
export const uploadFromMemory = async (destFileName, content) => {
  await storage.bucket(bucketName).file(destFileName).save(content);
}