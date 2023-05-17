const exprerss = require("express");
const dbConnect = require("./database/index");
const { PORT } = require("./config/index");

const app = exprerss();

dbConnect();

app.get("/", (req, res) => res.json({ msg: "Hello World!" }));

app.listen(PORT, console.log(`Backend Running on PORT : ${PORT}`));
