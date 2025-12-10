"use strict";
const { startTask, startDailyTask } = require("./cron/dailytask");
  startTask();
  startDailyTask();
  require("./server");
