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
        contents: {
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
}