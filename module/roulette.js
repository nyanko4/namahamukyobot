//createRoulette以外の関数の作成


const { sendchatwork } = require("../ctr/message");

async function mainRoulette(body, messageId, roomId, accountId) {
  const match = body.match(/^\/(\S+)\s+(.+)$/i);
  if (!match) return;
  
  const command = match[1];
  const message = match[2];
  
  switch (command) {
    case "/create":
      break await createRoulette(message, messageId, roomId, accountId);
    case "/delete":
      break await deleteRoulette(message, messageId, roomId, accountId);
    case "/roulette":
      break await startRoulette(message, messageId, roomId, accountId);
    case "/list":
      break await listRoulette(message, messageId, roomId, accountId);
  }
}

async function createRoulette(message, messageId, roomId, accountId) {
  const match = message.match(/^(.+?)\s+([^,、].*)$/);
  if (!match) return await sendchatwork(`[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n形式が正しくありません(例 /create ルーレットの名前 a,b,c,d,e)`);
  const rouletteName = match[1];
  const rouletteContent = match[2].trim().split(/[,、]/);
  
  const { error } = await supabase
      .from("roulette")
      .insert([
        {
          roulette_name: rouletteName,
          roulette_content: rouletteContent,
        }
      ])
    if (error) {
      console.error("createRouletteError", error.message, error.details, error.hint);
      if (error.code === "23505") return await sendchatwork(`[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n既にあります`);
      return await sendchatwork(`[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\nエラーが発生しました`);
    }
  return await sendchatwork(`[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n作成しました`);
}

async function deleteRoulette(message, messageId, roomId, accountId) {
  
}

async function startRoulette(message, messageId, roomId, accountId) {
  
}

async function listRoulette(message, messageId, roomId, accountId) {
  
}

module.exports = mainRoulette;
