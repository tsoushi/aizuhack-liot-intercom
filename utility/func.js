import { systemLogger } from '../logger.js';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';

const storage = new Storage();
const BUCKETNAME = 'liot-intercom';
const CLOUD_STORAGE_URL = 'https://storage.googleapis.com/';

// 日時からファイル名を生成する
export const genFileNameFromDatetime = (ext, date=Date.now()) => {
    const dt = new Date(date);
    return dt.toISOString().replace(/[\-T\:\.]/g, '_').replace('Z', '') + '.' + ext;
}

// 画像データを保存して画像へのURLをリターンする（非同期）
export const genImageUrlFromBytes = async (data) => {
    systemLogger.trace('画像データからURLを生成')
    const fileName = genFileNameFromDatetime('jpg');
    let path = 'image/' + fileName;

    let url;
    // クラウドストレージが使用可能かどうか
    if (!process.env.NO_CLOUD_STORAGE) {
      await uploadFromMemory(path, data);

      url = CLOUD_STORAGE_URL + BUCKETNAME + '/image/' + fileName;
    } else {
      // 使用不可の場合ローカルに保存
      await saveToLocal('public/' + path, data);
      url = process.env.HOSTNAME + '/static/' + path;
    }
    systemLogger.trace('画像データからURLを生成 -> 完了 url: '+url);
    return url;
}

// gcsに画像をアップロード
export const uploadFromMemory = async (destFileName, content) => {
  await storage.bucket(BUCKETNAME).file(destFileName).save(content);
}

// ローカルのディレクトリに保存
export const saveToLocal = async (destFileName, content) => {
  fs.writeFileSync(destFileName, content);
}

export const dateToDatabaseDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

export const dateToLocaleString = (date) => {
  return date.toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'});
}