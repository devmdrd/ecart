const User = require("../models/user-model");

exports.renderAdminDashboard = (req, res) => {
  res.render("admin/dashboard", { layout: "layouts/admin-layout" });
};

exports.renderAdminLogin = (req, res) => {
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
      return res.render("admin/login", {
        layout: "layouts/user-layout",
        message: "Invalid username or password",
        user: false,
      });
    }

    req.session.admin = adminData;
    res.redirect("/admin/dashboard");
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};

const blockUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.blocked = true;
    await user.save();
    res.redirect("/admin/view-user");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const unblockUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.blocked = false;
    await user.save();
    res.redirect("/admin/view-user");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const getUserLists = async (req, res) => {
  try {
    const usersData = await User.find();
    res.render("admin/view-user", { usersData });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
};

const searchUsers = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    if (!searchQuery) {
      res.redirect("/admin/view-user");
      return;
    }

    const usersData = await User.find({
      $or: [
        { username: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ],
    });

    res.render("admin/view-user", { usersData });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};

module.exports = {
  blockUser,
  unblockUser,
  getUserLists,
  searchUsers
};
