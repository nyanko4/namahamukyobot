const { sendchatwork } = require("../ctr/message");
const { sendername } = require("../ctr/cwdata");

async function getOmikujiResult() {
  const outcomes = [
    { rate: 15, result: "大吉" },
    { rate: 20, result: "中吉" },
    { rate: 30, result: "小吉" },
    { rate: 32, result: "末吉" },
    { rate: 3, result: "はむ吉" }
  ];
  let random = Math.random() * 100;
  for (const { rate, result } of outcomes) {
    if (random < rate) return result;
    random -= rate;
  }
}

async function omikuji(body, messageId, roomId, accountId) {
  if (body.match(/^おみくじ$/)) {
    try {

      const name = await sendername(accountId, roomId);
      const omikujiResult = await getOmikujiResult();
      
      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}]\n${omikujiResult}`,
        roomId
      );

    } catch (error) {
      console.error("おみくじエラー:", error.message);
    }
  }
  return;
}

module.exports = omikuji;
