const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const { v4: uuidv4 } = require("uuid");
const nocache = require("nocache");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");

// Configurations
require("./src/config/db")
require('./src/config/passport');

// Routers
const customerRouter = require("./src/api/routes/customer");
const adminRouter = require("./src/api/routes/admin");

const app = express();
const PORT = process.env.PORT || 4000;

// View engine setup
app.set("views", path.join(__dirname, "./src/api/views"));
app.use(expressLayouts);
app.set("layout", "layouts/admin-layout");
app.set("view engine", "ejs");

// Middlewares
app.use(cors());
app.use(nocache());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./src/api/public")));

app.use(session({
  secret: process.env.SESSION_SECRET || uuidv4(),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
}));

app.use(passport.initialize());
app.use(passport.session()); 

// Routes
app.use("/", customerRouter);
app.use("/admin", adminRouter);

// 404 Page
app.use((req, res) => {
  res.status(404).render("error", {
    layout: "layouts/user-layout",
    user: false
  });
});

// General error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500).render("error");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
