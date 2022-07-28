export const text = (text) => {
    return {
        type: "text",
        text: text
    }
}

// 訪問者の写真ビュー用のメッセージを生成する
export const visitorsImage = (imageUrl) => {
    return {
        type: 'flex',
        altText: 'This is a Flex Message',
        contents: {
            type: "bubble",
            hero: {
                type: "image",
                url: imageUrl,
                size: "full",
                aspectMode: "fit"
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: []
            }
        }
    }
}