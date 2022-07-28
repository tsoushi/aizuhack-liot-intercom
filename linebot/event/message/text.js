import { utility } from "../../../utility.js"

export const textEvent = async (event, client) => {
    let message;

    console.log('テキストメッセージを受信: ' + event.message.text);
    //メッセージのテキストごとに条件分岐
    if(event.message.text.startsWith('deviceid=')) {
        utility.database.addDeviceID(event.userId, event.message.text.substr(9));
        return;
    }

    if (event.message.text.startsWith('removedeviceid=')) {
        utility.database.removeDeviceID(event.message.text.substr(15));
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