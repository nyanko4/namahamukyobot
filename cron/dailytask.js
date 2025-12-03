const { CronJob } = require("cron");
const supabase = require("../supabase/client");

function startDailyTask() {
  new CronJob(
    "0 0 0 * * *",
    async () => {
      await supabase.from("おみくじ").delete().neq("accountId", 0);
    },
    null,
    true,
    "Asia/Tokyo"
  );
}

module.exports = startDailyTask;
