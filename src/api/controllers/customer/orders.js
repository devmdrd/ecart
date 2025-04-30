const Cart = require("../../models/cart");
const Wishlist = require("../../models/wishlist");
const Order = require("../../models/order");

exports.renderOrders = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const orders = await Order.find({ user: userId })
      .populate('address')
      .populate({ path: 'items.product', select: 'name images' })
      .populate({ path: 'items.sku', populate: { path: 'attributes.attributeId', select: 'name' } })
      .sort({ createdAt: -1 })
      .lean();

    const cart = await Cart.findOne({ user: userId });
    const wishlistCount = await Wishlist.countDocuments({ user: userId });

    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      date: order.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      status: order.status,
      total: order.totalAmount,
      paymentMethod: order.paymentMethod || 'Not specified',
      tracking: {
        placed: order.createdAt.toLocaleString('en-US'),
        processed: order.status === 'Pending' ? order.updatedAt.toLocaleString('en-US') : null,
        shipped: order.status === 'Shipped' ? order.updatedAt.toLocaleString('en-US') : null,
        delivered: order.status === 'Delivered' ? order.updatedAt.toLocaleString('en-US') : null,
        cancelled: order.status === 'Cancelled' ? order.updatedAt.toLocaleString('en-US') : null
      },
      shippingAddress: order.address ? {
        fullName: order.address.fullName,
        phone: order.address.phone,
        houseNameOrNo: order.address.houseNameOrNo,
        street: order.address.street,
        city: order.address.city,
        state: order.address.state,
        postalCode: order.address.postalCode,
        country: order.address.country
      } : null,
      products: order.items.map(item => ({
        id: item.product?._id?.toString() || 'unknown',
        name: item.product?.name || 'Product not available',
        variant: item.sku?.attributes?.map(attr => attr.attributeId?.name).filter(Boolean).join(", ") || 'No variant specified',
        quantity: item.quantity,
        price: item.sku?.discountPrice ?? item.sku?.price ?? 0,
        originalPrice: item.sku?.price ?? 0,
        discountPrice: item.sku?.discountPrice ?? null,
        image: item.product?.images?.[0] || ''
      }))
    }));

    res.render("client/accounts/order", {
      layout: "layouts/user-layout",
      activeTab: 'orders',
      orders: formattedOrders,
      user: true,
      cartCount: cart?.products?.length || 0,
      wishlistCount
    });
  } catch (err) {
    console.error("Render Orders Error:", err);
    res.render("client/error", {
      layout: "layouts/user-layout",
      message: "Internal server error",
      user: false
    });
  }
};
