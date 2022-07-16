export const textEvent = async (event, client) => {
    let message;

    console.log('テキストメッセージを受信: ' + event.message.text);
    //メッセージのテキストごとに条件分岐
    switch (event.message.text) {
        default: {
            message = {
                type: 'text',
                text: 'このメッセージの返信には対応していません...',
            };
            break;
        }
    }

    return message;
}