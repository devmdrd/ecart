const express = require("express");
const router = express.Router();

router.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.render("dashboard", { user: req.session.user });
  } else {
    res.redirect("/");
  }
});
module.exports = router;
