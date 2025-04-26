const User = require("../models/user");

exports.authenticateSession = async (req, res, next) => {
  const sessionUser = req.session?.user;

  if (!sessionUser) {
    if (req.originalUrl.startsWith("/admin")) {
      return res.redirect("/admin/login");
    }
    return res.render("client/login", { layout: "layouts/user-layout", user: false, message: "" });
  }

  try {
    const user = await User.findOne({ email: sessionUser.email });

    if (!user || user.isBlocked) {
      req.session.user = null;
      return res.render("client/login", { layout: "layouts/user-layout", user: false, message: "Your account has been blocked" });
    }

    if (req.originalUrl.startsWith("/admin") && !user.isAdmin) {
      return res.redirect("/");
    }

    req.session.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};
