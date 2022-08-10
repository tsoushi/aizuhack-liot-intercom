export const text = (text) => {
    return {
        type: "text",
        text: text
    }
}

// 訪問者の写真ビュー用のメッセージを生成する
export const visitorsImage = (imageUrl, date) => {
    return {
        type: 'flex',
        altText: 'This is a Flex Message',
        contents: visitorsImageBubble(imageUrl, date)
    }
}

const visitorsImageBubble = (imageUrl, date) => {
    return {
        type: 'bubble',
        hero: {
          type: 'image',
          url: imageUrl,
          size: 'full'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: date,
              size: 'xl',
              align: 'center'
            }
          ],
          paddingAll: 'md'
        }
    }
}

// 過去の訪問者一覧のメッセージを生成する
// database.getVisitorImages の戻り値をrecordsにそのまま渡す
export const visitorsImageLog = (records) => {
    const message = {
        type: 'flex',
        altText: '直近の訪問者一覧',
        contents: {
            type: 'carousel',
            contents: []
        }
    };

    for (const record of records) {
        message.contents.contents.push(
            visitorsImageBubble(
                record.imageUrl,
                record.datetime.toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})
            )
        );
    }

    return message;
}