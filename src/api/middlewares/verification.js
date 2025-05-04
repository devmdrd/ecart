const User = require("../models/user");

exports.authenticateSession = ({ required = true } = {}) => async (req, res, next) => {
  const sessionUser = req.session?.user;

  if (!sessionUser) {
    if (required) {
      return res.redirect(req.originalUrl.startsWith("/admin") ? "/admin/login" : "/login");
    }
    return next();
  }

  try {
    const user = await User.findOne({ email: sessionUser.email });

    if (!user || user.isBlocked) {
      req.session.user = null;
      if (required) {
        return res.redirect(req.originalUrl.startsWith("/admin") ? "/admin/login" : "/login");
      }
      return next();
    }

    if (req.originalUrl.startsWith("/admin") && !user.isAdmin) {
      return res.redirect("/");
    }

    req.session.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
