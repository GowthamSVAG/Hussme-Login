require("dotenv").config();
const expresss = require("express");
const mongoose = require("mongoose");
const routes = require("./Router");

const app = expresss();

app.use(expresss.json());
app.use("/api", routes);
// app.use("/user", routes);
mongoose.connect(process.env.MONGO_URI);
const database = mongoose.connection;
database.on("error", (err) => console.log(err));
database.on("connected", () => console.log("Database Connected"));

app.listen(3000, () => {
  console.log("Server Start on locaL HOST:3000");
});
