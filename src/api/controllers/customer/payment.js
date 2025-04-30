const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/order');
const Cart = require('../../models/cart');

exports.createStripePaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount provided' 
      });
    }

    const amountInPaise = Math.round(amount * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: 'inr',
      payment_method_types: ['card'],
      metadata: { userId: req.session?.user?._id.toString() || 'guest' },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error creating PaymentIntent' 
    });
  }
};

exports.completeOrder = async (req, res) => {
  try {
    const { paymentIntentId, paymentMethod, amount, addressId } = req.body;
    const { productId, skuId, quantity } = req.body.items;
    const userId = req.session.user?._id;

    if (paymentMethod === 'ONLINE') {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ success: false, message: `Payment not completed. Status: ${paymentIntent.status}` });
      }
    }

    if (productId && skuId && quantity && paymentMethod === 'COD') {
      const order = new Order({
        user: userId,
        address: addressId,
        items: [{
          product: productId,
          sku: skuId,
          quantity: quantity,
        }],
        totalAmount: amount,
        paymentMethod,
        status: 'Pending',
      });

      await order.save();

      return res.json({ success: true, orderId: order._id, message: 'Order placed successfully' });
    }

    const cart = await Cart.findOne({ user: userId }).populate('products.product products.sku');

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const order = new Order({
      user: userId,
      address: addressId,
      items: cart.products.map(item => ({
        product: item.product._id,
        sku: item.sku._id,
        quantity: item.quantity,
      })),
      totalAmount: amount,
      paymentMethod,
      status: 'Pending',
    });

    await order.save();
    await Cart.findOneAndUpdate({ user: userId }, { $set: { products: [] } });

    res.json({ success: true, orderId: order._id, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ success: false, message: error.message || 'Error completing order' });
  }
};

exports.renderOrderSuccess = async (req, res, next) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.render("client/orders/order-success", {
        layout: "layouts/user-layout",
        user: false,
        cartCount: "",
        wishlistCount: "",
      });
    }
    const cartCount = req.session.cartCount || 0;
    const wishlistCount = req.session.wishlistCount || 0;

    return res.render("client/orders/order-success", {
      layout: "layouts/user-layout",
      user: user,
      cartCount: cartCount,
      wishlistCount: wishlistCount,
    });

  } catch (error) {
    console.error("Error rendering order success:", error);
    next(error);
  }
};
