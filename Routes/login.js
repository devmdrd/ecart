const express = require("express");
const fs = require("fs");
const router = express.Router();

const credentials = {
  email: "rashid@gmail.com",
  password: "rashid123",
};
router.get("/login", (req, res) => {
  const dynamicContent = fs.readFileSync("./views/login.ejs", "utf8");
  res.render("login.ejs", { content: dynamicContent });
});

router.post("/login", (req, res) => {
  if (
    req.body.email === credentials.email &&
    req.body.password === credentials.password
  ) {
    req.session.user = req.body.email;
    res.redirect("/dashboard");
  } else {
   
    res.render("login", { message: "Incorrect username or password" });
  }
});
module.exports = router;
