export const postbackFunc = (event) => {
    let message;

    // ポストバックデータをpostbackDataに格納
    const postbackData = event.postback.data;

    // ここでpostback受信時の条件分岐を作る
    console.log(`ポストバックデータを受信: ${postbackData}`);

    return message;
}