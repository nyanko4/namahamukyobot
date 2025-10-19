const { sendchatwork } = require("../ctr/message");
const { sendername } = require("../ctr/cwdata");
const Redis = require('ioredis');
const redis = new Redis({
  host: 'localhost',
  port: 6379
});

function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight - now) / 1000);
}

async function getOmikujiResult() {
  const outcomes = [
    { rate: 15, result: "大吉" },
    { rate: 20, result: "中吉" },
    { rate: 30, result: "小吉" },
    { rate: 32, result: "末吉" },
    { rate: 3, result: "はむ吉" },
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
      const key = `omikuji:${accountId}`;
      
      const existingData = await redis.get(key);
      
      if (existingData) {
        await sendchatwork(
          `[rp aid=${accountId} to=${roomId}-${messageId}] おみくじは1日1回までです。`,
          roomId
        );
        return;
      }

      const name = await sendername(accountId, roomId);
      
      const omikujiResult = await getOmikujiResult();
      
      const dataToSave = JSON.stringify({
        accountId,
        結果: omikujiResult,
        名前: name,
      });
      
      const ttlSeconds = getSecondsUntilMidnight();
      
      await redis.set(key, dataToSave, 'EX', ttlSeconds);
      
      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}]\n${omikujiResult}`,
        roomId
      );

      console.log("おみくじ結果が保存されました:", { accountId, 結果: omikujiResult, 名前: name });
      
    } catch (error) {
      console.error("エラー:", error.message);
    }
  }
}

module.exports = omikuji;

process.on('SIGTERM', () => {
  redis.quit();
});
