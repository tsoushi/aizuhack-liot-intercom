// モジュール読み込み
import crypto from 'crypto';
import { lineLogger } from '../logger.js';
import { utility } from '../utility.js';

// 各イベントごとの処理をするファイルの読み込み
import { messageFunc } from './event/message.js';
// import { unsendFunc } from './event/unsend.js';
import { postbackFunc } from './event/postback.js';
// import { joinFunc } from './event/join.js';
// import { leaveFunc } from './event/leave.js';
// import { followFunc } from './event/follow.js';
// import { unfollowFunc } from './event/unfollow.js';
// import { memberJoinedFunc } from './event/memberJoined.js';
// import { memberLeftFunc } from './event/memberLeft.js';


export const index = (req, res) => {
    // 署名検証
    const signature = crypto
        .createHmac('sha256', process.env.channelSecret)
        .update(JSON.stringify(req.body))
        .digest('base64');
    const checkHeader = req.header('X-Line-Signature');
    const { events } = req.body;
    // 署名検証が成功した時
    if (signature === checkHeader) {
        // eventsは配列になっているため、forEachで1つずつ処理をする
        events.forEach(async (event) => {
            let message;

            // イベントごとに条件分岐
            switch (event.type) {
                // メッセージ
                case 'message': {
                    message = await messageFunc(event);
                    break;
                }

                // 送信取り消し
                case 'unsend': {
                    // message = unsendFunc(event);
                    break;
                }

                // ポストバック
                case 'postback': {
                    message = postbackFunc(event);
                    break;
                }

                // 参加
                case 'join': {
                    // message = joinFunc();
                }

                // 退出
                case 'leave': {
                    // leaveFunc(event);
                    break;
                }

                // フォロー
                case 'follow': {
                    // message = followFunc();
                    break;
                }

                // フォロー解除
                case 'unfollow': {
                    // message = followFunc();
                    break;
                }

                // メンバー参加
                case 'memberJoined': {
                    // message = memberJoinedFunc(event);
                    break;
                }

                // メンバー退出
                case 'memberLeft': {
                    // memberLeftFunc(event);
                    break;
                }

                default: {
                    break;
                }
            }

            // messageがundefinedでなければ
            if (message !== undefined) {
                lineLogger.debug(`返信メッセージ: ${JSON.stringify(message)}`);
                // メッセージを返信
                utility.lineClient.replyMessage(event.replyToken, message).catch(() => {});
            }
        });
    // 署名検証に失敗した場合
    } else {
        console.log('署名認証エラー');
    }

    return res.json('ok');
}
