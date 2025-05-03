const Order = require("../../models/order");
const Attribute = require('../../models/attribute'); 

exports.renderOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email username')
      .populate('address', 'houseNameOrNo street city state postalCode country fullName phone')
      .populate('items.product', 'name description category brand images')
      .populate('items.sku', 'price discountPrice stock')  
      .populate('items.sku.attributes.attributeId', 'name values')  
      .populate('items.sku.attributes.valueId', 'value');  

    res.render("admin/orders", { orders });
  } catch (error) {
    console.error("Error in Render Orders:", error);
    res.status(500).json({ success: false, message: "Error loading orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
  
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
  
        order.status = status;
        await order.save();
  
        res.status(200).json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: 'Error updating order status' });
    }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('address', 'houseNameOrNo street city state postalCode country fullName phone')
      .populate('items.product', 'name description category brand images')
      .populate('items.sku', 'price discountPrice stock attributes'); 

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const transformedOrder = order.toObject();

    for (const item of transformedOrder.items) {
      const attributes = item.sku.attributes;

      const attributeValuePromises = attributes.map(async attr => {
        const attribute = await Attribute.findById(attr.attributeId);
        const valueObj = attribute?.values.find(v => v._id.toString() === attr.valueId.toString());
        return valueObj?.value || 'Unknown';
      });

      item.sku.attributes = await Promise.all(attributeValuePromises);
    }

    res.status(200).json({ success: true, order: transformedOrder });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: 'Error fetching order details' });
  }
};
