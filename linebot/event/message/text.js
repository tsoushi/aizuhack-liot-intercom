import { utility } from "../../../utility.js"
import { lineLogger } from '../../../logger.js';




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

export const textEvent = async (event) => {
    const text = event.message.text;
    const userId = event.source.userId;

    lineLogger.debug('テキストメッセージを受信: ' + text);

    if (await utility.database.getContext(userId) == "registerMode") {
        utility.database.addDeviceID(userId, text);
        utility.database.deleteContext(userId);
        return utility.makeMessage.text(`デバイスID「${text}」を登録しました`);
    }

    if (await utility.database.getContext(userId) == "talkMode") {
        if (!await isDeviceIdRegistered(event)) return nullDeviceIdMessage;
        utility.database.addReplyMessageByUserId(userId, text);
        utility.database.deleteContext(userId);
        return utility.makeMessage.text('メッセージを送信しました');
    }

    //メッセージのテキストごとに条件分岐
    if(text.startsWith('deviceid=')) {
        utility.database.addDeviceID(userId, text.substr(9));
        return utility.makeMessage.text(`デバイスID「${text.substr(9)}」を登録しました`);
    }

    if (text == 'removedeviceid') {
        if (!await isDeviceIdRegistered(event)) return nullDeviceIdMessage; // デバイスIDが存在するかどうかを調べる
        utility.database.removeDeviceIDByUserID(userId);
        return utility.makeMessage.text('デバイスIDの登録を解除しました');
    }
    
    if (text.startsWith('reply=')) {
        if (!await isDeviceIdRegistered(event)) return nullDeviceIdMessage;
        utility.database.addReplyMessageByUserId(userId, text.substr(6));
        return utility.makeMessage.text('メッセージを送信しました');
    }

    if (text == '登録'){
        await utility.database.setContext(userId, 'registerMode');
        return utility.makeMessage.text('デバイスIDを入力してください');
    }

    if (text == '会話') {
        await utility.database.setContext(userId, 'talkMode');
        return utility.makeMessage.text('返信するメッセージを入力してください');
    }

    if (text == 'ヘルプ') {
        return utility.makeMessage.text('以下のメッセージに対しての応答\n履歴: 直近の訪問者の履歴を表示\n会話: 訪問者への返信メッセージを入力\n登録: デバイスIDの登録');
    }

    return;
}