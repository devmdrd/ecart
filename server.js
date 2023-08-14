const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const session = require("express-session");
// const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const loginRouter = require("./Routes/login.js");
const dashboardRouter = require("./Routes/dashboard.js");
const logoutRouter = require("./Routes/logout.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  const dynamicContent = fs.readFileSync("./views/main.ejs", "utf8");
  res.render("index.ejs", { content: dynamicContent });
});

app.use("/", loginRouter);
app.use("/",dashboardRouter);
app.use("/",logoutRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT);
