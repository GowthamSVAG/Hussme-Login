require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./Router");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', routes);
mongoose.connect(process.env.MONGO_URI);
const database = mongoose.connection;
database.on("error", (err) => console.log(err));
database.on("connected", () => console.log("Database Connected"));

app.listen(process.env.PORT, () => {
  console.log(`Server Start on locaL HOST:${process.env.PORT}`);
});
