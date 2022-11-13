export const text = (text) => {
    return {
        type: "text",
        text: text
    }
}

// 訪問者の写真ビュー用のメッセージを生成する
export const visitorsImage = (imageUrl, date, name) => {
    if (name == 'unknown') name = '訪問者';
    return {
        type: 'flex',
        altText: 'This is a Flex Message',
        contents: {
            type: "bubble",
            header: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: name + "が来ました",
                  weight: "bold",
                  color: "#ffffff"
                }
              ],
              backgroundColor: "#00a48d"
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: date,
                      color: "#999999"
                    }
                  ],
                  paddingStart: "10px",
                  paddingBottom: "10px"
                },
                {
                  type: "image",
                  url: imageUrl,
                  size: "full",
                  aspectMode: "fit",
                  aspectRatio: "16:9"
                },
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "button",
                      action: {
                        type: "message",
                        label: "会話する",
                        text: "会話"
                      },
                      style: "primary"
                    },
                    {
                      type: "button",
                      action: {
                        type: "postback",
                        label: "既読",
                        data: "removeVisitorImageLog:" + imageUrl
                      },
                      style: "secondary",
                      margin: "10px"
                    }
                  ],
                  paddingAll: "20px"
                }
              ],
              paddingAll: "0px"
            },
            styles: {
              hero: {
                separator: true
              }
            }
        }
    }
}

const visitorsImageBubble = (imageUrl, date, name) => {
    return {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: name,
              weight: "bold",
              color: "#ffffff"
            }
          ],
          backgroundColor: "#00a48d"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: date,
                  color: "#999999"
                }
              ],
              paddingStart: "10px",
              paddingBottom: "10px"
            },
            {
              type: "image",
              url: imageUrl,
              size: "full",
              aspectMode: "fit",
              aspectRatio: "16:9"
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "button",
                  action: {
                    type: "postback",
                    label: "既読",
                    data: "removeVisitorImageLog:" + imageUrl
                  },
                  style: "primary",
                  margin: "10px"
                }
              ],
              paddingAll: "20px"
            }
          ],
          paddingAll: "0px"
        },
        styles: {
          hero: {
            separator: true
          }
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
                record.datetime.toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'}),
                record.name
            )
        );
    }

    return message;
}
