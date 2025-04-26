const User = require("../../models/user");

exports.renderLogin = (req, res) => {
  if (req.session.admin) return res.redirect("/admin/dashboard");

  res.render("admin/login", {
    layout: "layouts/user-layout",
    message: "", 
    user: false,
  });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminData = await User.findOne({ username });

    if (!adminData || password !== adminData.password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    req.session.user = adminData;
    res.json({ success: true, message: "Login successful" });
  } catch {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");   
  });
};
  