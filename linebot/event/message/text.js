import { utility } from "../../../utility.js"

export const textEvent = async (event) => {
    let message;

    console.log('テキストメッセージを受信: ' + event.message.text);
    //メッセージのテキストごとに条件分岐
    if(event.message.text.startsWith('deviceid=')) {
        utility.database.addDeviceID(event.source.userId, event.message.text.substr(9));
        return;
    }

    if (event.message.text == 'removedeviceid') {
        utility.database.removeDeviceIDByUserID(event.source.userId);
        return;
    }
    
    if (event.message.text.startsWith('reply=')) {
        utility.database.addReplyMessageByUserId(event.source.userId, event.message.text.substr(6))
            .catch(() => {
                utility.lineClient.replyMessage(
                    event.replyToken,
                    utility.makeMessage.text('デバイスIDが登録されていません')
                );
            });
        return;
    }

    switch (event.message.text) {
        default: {
            message = utility.makeMessage.text('このメッセージの返信には対応していません...');
            break;
        }
    }

    return message;
}