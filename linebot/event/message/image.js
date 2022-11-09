import { utility } from "../../../utility.js"
import { lineLogger } from '../../../logger.js';
import fs from 'fs';

const nullDeviceIdMessage = utility.makeMessage.text('デバイスIDを登録してください');

// デバイスIDが登録されているか確認する。
// されていなければreplyMessageを送り、戻り値としてfalseを返す。
const isDeviceIdRegistered = async (event) => {
    if (await utility.database.getDeviceIDFromUserID(event.source.userId) === null) {
        return false;
    } else {
        return true;
    }
}

export const imageEvent = async (event) => {
    const userId = event.source.userId;

    lineLogger.debug('画像メッセージを受信: ' + event.message.contentProvider.type);
    lineLogger.debug('画像メッセージを受信: ' + event.message.contentProvider.originalContentUrl);
    lineLogger.debug('画像メッセージを受信: ' + event.message.id);
    lineLogger.debug('画像メッセージを受信: ' + event.message.imageSet);

    // 顔認識用写真の送信キュー追加
    if (await utility.database.getContext(userId) == 'sendRecogImage') {
        if (!isDeviceIdRegistered(event)) {
            return nullDeviceIdMessage;
        }
        if (event.message.contentProvider.type == 'line') {
            lineLogger.debug('顔認識用写真登録');
            let stream = await utility.lineClient.client.getMessageContent(event.message.id);

            // stream から Buffer へデータを変換
            let data = [];
            for await (const chunk of stream) {
                data.push(chunk);
            }
            data = Buffer.concat(data);
        
            // ファイル書き込み
            const url = await utility.func.genImageUrlFromBytes(data);
            
            await utility.database.addFaceRecogImageQueue(await utility.database.getDeviceIDFromUserID(userId), url);

            await utility.database.deleteContext(userId);
            return utility.makeMessage.text('登録しました');
        }
        return utility.makeMessage.text('登録に失敗しました');
    }

    return;
}