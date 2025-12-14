const { CronJob } = require("cron");
const supabase = require("../supabase/client");
const { dailyComment, commentRankingMinute } = require("../module/commentRanking");
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
  new CronJob(
  "3 0 0 * * 1",
  async () => {
    try {
      const { error } = await supabase
        .from("message_num")
        .delete()
        .neq("account_id", 0);

      if (error) console.error("message_num reset error:", error);

      console.log("message_num reset completed");
    } catch (err) {
      console.error("midnight task error:", err.message);
    }
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
