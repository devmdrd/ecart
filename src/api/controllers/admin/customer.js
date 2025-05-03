const User = require("../../models/user"); 

exports.renderCustomerList = async (req, res) => {
  try {
    const customers = await User.find({ isAdmin: false, isDeleted: false }).sort({ createdAt: -1 });
    res.render("admin/customers", { customers });
  } catch (error) {
    console.error("Error retrieving customers:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve customers" });
  }
};

exports.updateCustomer = async (req, res) => {
  const { customerId, isBlocked } = req.body;

  try {
    const updatedCustomer = await User.findByIdAndUpdate(
      customerId,
      { isBlocked: Boolean(isBlocked) },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, message: `Customer has been ${isBlocked ? "blocked" : "unblocked"} successfully.` });
  } catch (error) {
    console.error("Error updating customer status:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deleteCustomer = async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const customer = await User.findById(customerId);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    customer.isDeleted = true;
    await customer.save();

    res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ success: false, message: "Failed to delete customer" });
  }
};
