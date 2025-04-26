exports.renderAdminDashboard = (req, res) => {
  res.render("admin/dashboard", { layout: "layouts/admin-layout" });
};
