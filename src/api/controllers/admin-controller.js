const Admin = require("../models/admin-model");
const User = require("../models/user-model");
// const flash = require("express-flash");

const getAdminDashboard = (req, res) => {
  res.render("admin/dashboard", { layout: "layouts/admin-layout" });
};

const getAdminLogin = (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin/dashboard");
  } else {
    res.render("admin/login", {
      layout: "layouts/user-layout",
      errorMessage: "",
      user: false,
    });
  }
};

const adminLoginPost = async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminData = await Admin.findOne({ username: username });
    console.log(adminData);
    if (adminData) {
      if (password === adminData.password) {
        req.session.admin = adminData;

        res.redirect("/admin/dashboard");
      } else {
        res.render("admin/login", {
          layout: "layouts/user-layout",
          errorMessage: "Password is Incorrect",
          user: false,
        });
      }
    } else {
      res.render("admin/login", {
        layout: "layouts/user-layout",
        errorMessage: "Username not Found",
        user: false,
      });
    }
  } catch (error) {
    res.status(500).send(error.log);
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

const adminLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/admin/login");
  });
};

module.exports = {
  getAdminDashboard,
  getAdminLogin,
  adminLoginPost,
  blockUser,
  unblockUser,
  getUserLists,
  searchUsers,
  adminLogout,
};
