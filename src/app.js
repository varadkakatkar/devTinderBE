const express = require("express");
const app = express();

app.use("/hello", (req, res) => {
  res.send("Hello from server ............");
});

app.use("/test", (req, res) => {
  res.send("Hello World test");
});

app.listen(3000, () => {
  console.log("Server is running on 3000");
});
