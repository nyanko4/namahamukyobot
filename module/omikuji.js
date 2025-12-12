const supabase = require("../supabase/client");
const { sendchatwork } = require("../ctr/message");
const USERS = {
  namahamu: { accountId: 10788301, exception: true, special: false },
  roripero: { accountId: 10512700, exception: true, special: true },
  karasuke: { accountId: 10484104, exception: true, special: true },
  roukuma: { accountId: 10754178, exception: true, special: true },
  taikichi: { accountId: 10546423, exception: true, special: true },
}

const USER_BY_ID = Object.fromEntries(
  Object.values(USERS).map(user => [user.accountId, user])
);

async function getOmikujiResult(accountId) {
  
  const normaloutcomes = [
    { rate: 15, result: "大吉" },
    { rate: 20, result: "中吉" },
    { rate: 30, result: "小吉" },
    { rate: 31.5, result: "末吉" },
    { rate: 3, result: "はむ吉" },
    { rate: 0.5, result: "生ハムがなんでもしてくれる券(本人が許可したもののみ)" },
  ];
  
  const specialoutcomes = [
    { rate: 15, result: "大吉" },
    { rate: 20, result: "中吉" },
    { rate: 30, result: "小吉" },
    { rate: 31.9, result: "末吉" },
    { rate: 3, result: "はむ吉" },
    { rate: 0.1, result: "生ハムがなんでもしてくれる券(本人が許可したもののみ)" },
  ]
  
  const outcomes = USER_BY_ID[accountId]?.special ? specialoutcomes : normaloutcomes;

  let random = Math.random() * 100;
  for (const { rate, result } of outcomes) {
    if (random < rate) return result;
    random -= rate;
  }}

//おみくじ
async function omikuji(body, messageId, roomId, accountId) {
  if (/^おみくじ$/.test(body) || (/^布瑠部由良由良八握剣異戒神将御神籤$/.test(body) && accountId === 10787667)) {
    try {
      const { data, error } = await supabase
        .from("おみくじ")
        .select("*")
        .eq("accountId", accountId)
        .single();

      if (error) {
        console.error("Supabaseエラー:", error);
      }

      if (data && !USER_BY_ID[accountId]?.exception) {
          await sendchatwork(
            `[rp aid=${accountId} to=${roomId}-${messageId}] おみくじは1日1回までです。`,
            roomId
          );
          return;
      }
      const omikujiResult = await getOmikujiResult(accountId);
      const { data: insertData, error: insertError } = await supabase
        .from("おみくじ")
        .upsert([
          {
            accountId: accountId,
            結果: omikujiResult,
          },
        ]);
        await sendchatwork(`[rp aid=${accountId} to=${roomId}-${messageId}]\n${omikujiResult}`, roomId);
      if (insertError) {
        console.error("Supabase保存エラー:", insertError);
      } else {
        console.log("おみくじ結果が保存されました:", insertData);
      }
        } catch (error) {
      console.error(
        "エラー:",
        error.response ? error.response.data : error.message
      );
    }
  }
}

module.exports = omikuji;
