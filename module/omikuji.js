const supabase = require("../supabase/client");
const { sendchatwork } = require("../ctr/message");
const namahamu = 10788301;
const roripero = 10512700;
const karasuke = 10484104;

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

  let outcomes = normaloutcomes;
  if (accountId === roripero || accountId === karasuke) {
    outcomes = specialoutcomes;
  }

  let random = Math.random() * 100;
  for (const { rate, result } of outcomes) {
    if (random < rate) return result;
    random -= rate;
  }}

//おみくじ
async function omikuji(body, messageId, roomId, accountId) {
  if (body.match(/^おみくじ$/)) {
    try {
      const { data, error } = await supabase
        .from("おみくじ")
        .select("*")
        .eq("accountId", accountId)
        .single();

      if (error) {
        console.error("Supabaseエラー:", error);
      }

      if (data && accountId !== namahamu && accountId !== roripero && accountId !== karasuke) {
          await sendchatwork(
            `[rp aid=${accountId} to=${roomId}-${messageId}] おみくじは1日1回までです。`,
            roomId
          );
          //console.log(data);
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
      console.log(insertData)
      if (insertData === null) {
        await sendchatwork(
          `[rp aid=${accountId} to=${roomId}-${messageId}]\n${omikujiResult}`,
          roomId
        );
      }
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
