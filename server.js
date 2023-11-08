var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const { v4: uuidv4 } = require("uuid");
const nocache = require("nocache");
const flash = require("connect-flash");
const session = require("express-session");
const cors = require("cors");
const passport = require("./src/api/middlewares/passport-config");
const { isUserAuthenticated } = require("./src/api/middlewares/verification");
require("./src/config/connection");

const adminRouter = require("./src/api/routes/admin-route");
const usersRouter = require("./src/api/routes/user-route");
const Category = require("./src/api/models/category-model");
const Brand = require("./src/api/models/brand-model");
const Product = require("./src/api/models/product-model");
const Banner = require("./src/api/models/banner-model");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "./src/api/views"));
app.use(expressLayouts);
app.set("layout", "layouts/admin-layout");
app.set("view engine", "ejs");
app.use(cors());
app.use(nocache());
app.use(flash());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./src/api/public")));

app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/admin", adminRouter);
app.use("/users", usersRouter);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Auth Callback
app.get("/auth/google/callback",
 passport.authenticate("google", {
    failureRedirect: "/users/login",
  }),
  (req, res) => {
    req.session.user = req.user;
    console.log("The session" + req.session.user);
  
    res.redirect("/users/dashboard");
  }
);
app.get("/", async (req, res) => {
  try {
    const categoryData = await Category.find();
    const brandData = await Brand.find();
    const bannerData = await Banner.find();

    const categoryIds = categoryData.map((category) => category._id);
    console.log(categoryIds);
    const product = await Product.find({ category: { $in: categoryIds } });
    console.log(product);

    // Attach products to their respective categories
    categoryData.forEach((category) => {
      category.products = product.filter((p) =>
        p.category.equals(category._id)
      );

      console.log(category.products);
    });

    console.log(categoryData);

    if (!req.session.user) {
      return res.render("client/dashboard", {
        layout: "layouts/user-layout",
        user: false,
        categoryData,
        brandData,
        bannerData,
      });
    }
    console.log("sfysdyfs");
    res.render("client/dashboard", {
      layout: "layouts/user-layout",
      user: true,
      categoryData,
      brandData,
      bannerData,
    });
  } catch (error) {
    console.error(error);
    // Handle error and send an error response if needed.
  }
});

app.use(function (req, res, next) {
  res.render("error", {
    layout: "layouts/user-layout",
    user: false,
  });
});

// error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});
