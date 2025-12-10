const { CronJob } = require("cron");
const supabase = require("../supabase/client");
const { dailyComment } = require("../module/commentRanking");
const { getMessages } = require("../ctr/message");

function startTask() {
  new CronJob(
    "5 * * * * *",
    async () => {
      try {
        console.log("1分たちました");
        await commentRankingMinute();
      } catch (err) {
        console.error("commentRankingMinute error:", err.message);
      }
    },
    null,
    true,
    "Asia/Tokyo"
  );
}

function startDailyTask() {
  new CronJob(
  "0 0 0 * * *",
  async () => {
    console.log("0時になりました");
    await supabase.from("おみくじ").delete().neq("accountId", 0);
    await dailyComment()
  },
    null,
    true,
    "Asia/Tokyo"
  );
}


module.exports = {
  startTask,
  startDailyTask,
};
