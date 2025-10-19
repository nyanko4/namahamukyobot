const { sendchatwork } = require("../ctr/message");
const { sendername } = require("../ctr/cwdata");
const RedisMock = require('redis-mock');
const fs = require('fs').promises;
const path = require('path');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');

const redis = new RedisMock.createClient();

const DATA_FILE = path.join(__dirname, '../redis-data.json');

async function saveToFile() {
  try {
    const keys = await new Promise((resolve, reject) => {
      redis.keys('*', (err, keys) => (err ? reject(err) : resolve(keys)));
    });
    const data = {};
    for (const key of keys) {
      data[key] = await new Promise((resolve, reject) => {
        redis.get(key, (err, value) => (err ? reject(err) : resolve(value)));
      });
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('データ保存エラー:', error.message);
  }
}

async function loadFromFile() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    for (const [key, value] of Object.entries(parsed)) {
      await new Promise((resolve, reject) => {
        redis.set(key, value, (err) => (err ? reject(err) : resolve()));
      });
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('データ復元エラー:', error.message);
    }
  }
}

loadFromFile();

redis.on('error', (err) => {
  console.error('Redisモックエラー:', err.message);
});

function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = utcToZonedTime(zonedTimeToUtc(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), 'Asia/Tokyo'), 'Asia/Tokyo');
  return Math.floor((midnight - now) / 1000);
}

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
      const key = `omikuji:${accountId}`;
      const existingData = await new Promise((resolve, reject) => {
        redis.get(key, (err, value) => (err ? reject(err) : resolve(value)));
      });

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
        名前: name
      });

      const ttlSeconds = getSecondsUntilMidnight();
      await new Promise((resolve, reject) => {
        redis.set(key, dataToSave, 'EX', ttlSeconds, (err) => (err ? reject(err) : resolve()));
      });

      await saveToFile();

      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}]\n${omikujiResult}`,
        roomId
      );

      console.log("おみくじ結果が保存されました:", { accountId, 結果: omikujiResult, 名前: name });
    } catch (error) {
      console.error("おみくじエラー:", error.message);
    }
  }
  return;
}

module.exports = omikuji;

process.on('SIGTERM', async () => {
  await saveToFile();
  redis.quit();
});
