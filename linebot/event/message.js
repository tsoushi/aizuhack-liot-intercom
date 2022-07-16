// ファイル読み込み
// import { audioEvent } from './message/audio.js';
// import { fileEvent } from './message/file.js';
// import { imageEvent } from './message/image.js';
// import { locationEvent } from './message/location.js';
// import { stickerEvent } from './message/sticker.js';
import { textEvent } from './message/text.js';
// import { videoEvent } from './message/video.js';

export const messageFunc = async (event, client) => {
    let message;

    // メッセージタイプごとの条件分岐
    switch (event.message.type) {
        // テキスト
        case 'text': {
            message = await textEvent(event, client);
            break;
        }

        // 画像
        case 'image': {
            // message = imageEvent(event, client);
            break;
        }

        // 動画
        case 'vide': {
            // message = videoEvent(event, client);
            break;
        }

        // 音声
        case 'audio': {
            // message = audioEvent(event, client);
            break;
        }

        // 位置情報
        case 'location': {
            // message = locationEvent(event);
            break;
        }

        // スタンプ
        case 'sticker': {
            // message = stickerEvent(event);
            break;
        }

        // それ意外
        default: {
            message = {
                type: 'text',
                text: 'そのイベントには対応していません...',
            };
            break;
        }
    }

    return message;
}