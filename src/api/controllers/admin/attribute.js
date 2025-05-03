const Attribute = require("../../models/attribute");
const Category = require("../../models/category");

exports.renderManageAttribute = async (req, res) => {
  const attributeId = req.params.attributeId;

  try {
    const categories = await Category.find();

    if (!attributeId) {
      return res.render("admin/attributes/manage", { attribute: null, categories });
    }

    const attribute = await Attribute.findById(attributeId).populate("categoryId");

    if (!attribute) {
      return res.status(404).json({ success: false, message: "Attribute not found" });
    }

    res.render("admin/attributes/manage", { attribute, categories });
  } catch (error) {
    console.error("Error in Render Manage Attribute:", error);
    res.status(500).json({ success: false, message: "Error loading form" });
  }
};

exports.renderAttributeList = async (req, res) => {
  try {
    const attributes = await Attribute.find().populate("categoryId").sort({ createdAt: -1 });
    res.render("admin/attributes/list", { attributes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve attributes" });
  }
};

exports.createAttribute = async (req, res) => {
  const { name, values, categoryId } = req.body;

  try {
    const trimmedName = name.trim();
    const attributeValues = values.map(value => ({ value: value.trim() }));

    const existingAttribute = await Attribute.findOne({ name: trimmedName, categoryId });
    if (existingAttribute) {
      return res.status(409).json({ success: false, message: "Attribute already exists" });
    }

    const newAttribute = new Attribute({
      name: trimmedName,
      values: attributeValues,
      categoryId,
    });

    await newAttribute.save();
    res.status(201).json({ success: true, message: "Attribute created successfully" });
  } catch (error) {
    console.error("Error creating attribute:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateAttribute = async (req, res) => {
  const { attributeId, name, value, categoryId, valueId } = req.body;

  try {
    if (!attributeId) {
      return res.status(400).json({ success: false, message: "Attribute ID is required." });
    }

    const attribute = await Attribute.findById(attributeId);
    if (!attribute) {
      return res.status(404).json({ success: false, message: "Attribute not found." });
    }

    if (name) attribute.name = name.trim();
    if (categoryId) attribute.categoryId = categoryId;

    if (valueId) {
      const valIndex = attribute.values.findIndex(v => v._id.toString() === valueId);
      if (valIndex !== -1) {
        attribute.values[valIndex].value = value.trim();
      } else {
        return res.status(404).json({ success: false, message: "Attribute value not found." });
      }
    } else {
      attribute.values.push({ value: value.trim() });
    }

    await attribute.save();

    res.status(200).json({ success: true, message: valueId ? "Attribute value updated" : "Attribute value added" });
  } catch (error) {
    console.error("Update Attribute Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.deleteAttribute = async (req, res) => {
  const { attributeId, attributeValueId } = req.params;

  try {
    const attribute = await Attribute.findById(attributeId);
    if (!attribute) {
      return res.status(404).json({ success: false, message: "Attribute not found" });
    }

    const originalLength = attribute.values.length;
    attribute.values = attribute.values.filter(val => val._id.toString() !== attributeValueId);

    if (attribute.values.length === originalLength) {
      return res.status(404).json({ success: false, message: "Attribute value not found" });
    }

    await attribute.save();

    res.status(200).json({ success: true, message: "Attribute value deleted successfully" });
  } catch (error) {
    console.error("Delete Attribute Value Error:", error);
    res.status(500).json({ success: false, message: "Error occurred while deleting the attribute value" });
  }
};

