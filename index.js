require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./Router");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.json());
app.use('/api', routes);
mongoose.connect(process.env.MONGO_URI);
const database = mongoose.connection;
database.on("error", (err) => console.log(err));
database.on("connected", () => console.log("Database Connected"));

app.listen(process.env.PORT, () => {
  console.log(`Server Start on locaL HOST:${process.env.PORT}`);
});
