const express = require("express");

const app = express();

// ミドルウェア設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ルート登録
app.use("/", require("./routes/webhook"));
app.get('/send', (req, res) => {
  res.end(JSON.stringify(process.versions, null, 2));
  console.log("ぬ")
});
// サーバ起動
app.listen(3000, () => {
  console.log(`${process.pid} started`);
});
