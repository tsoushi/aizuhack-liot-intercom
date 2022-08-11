import { lineLogger } from "../../logger.js";
import { utility } from "../../utility.js";

export const postbackFunc = (event) => {
    // ポストバックデータをpostbackDataに格納
    const postbackData = event.postback.data;
    lineLogger.trace(`ポストバックデータを受信: ${postbackData}`);

    if (postbackData.startsWith('removeVisitorImageLog:')) {
        utility.database.removeVisitorImageLogByUrl(postbackData.substring(22));
        return utility.makeMessage.text('既読にしました');
    }
}