const User = require("../models/user-model");
const Category = require("../models/category-model");
const Brand = require("../models/brand-model");
const Product = require("../models/product-model");
const Cart = require("../models/cart-model");
const Order = require("../models/order-model");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const bcrypt = require("bcrypt");
// const flash = require("express-flash");
const Coupon = require("../models/coupon-model");
const Banner = require("../models/banner-model");
const path = require("path");
require("dotenv").config();

const getUserSignup =async (req, res) => {
  if (req.session.user) {
   
    return res.redirect("/users/dashboard");
  }

  res.render("client/sign-up", {
    layout: "layouts/user-layout",
    message: "",
    user: false,
  });
};

const userLoginPost = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const userData = await User.findOne({ username: username });

    if (!userData) {
      req.flash("message", "Username not found");
      return res.redirect("/users/login");
    }

    if (userData.blocked) {
      req.flash("message", "Your account has been blocked");
      return res.redirect("/users/login");
    }
    const password1 = await bcrypt.compare(password, userData.password);
    if (username === userData.username && password1) {
      req.session.user = userData;
      // const userId = req.session.user._id;
   
      console.log(req.session.user);
      return res.redirect("/users/dashboard");
    }
    req.flash("message", "Invalid password");
    return res.redirect("/users/login");
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

const getUserLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect("/users/dashboard");
  }
  const message = req.flash("message");
  if (message) {
    res.render("client/login", {
      layout: "layouts/user-layout",
      message: message,
      user: false,
    });
  }
};

// Function to register a new user
const registerNewUser = async (req, res, next) => {
  try {
    const { name, username, email, password, mobile } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userExists = await User.findOne({ $or: [ { username: username }, { email: email } ] });


    if (userExists) {
      return res.render("client/sign-up", {
        layout: "layouts/user-layout",
        message: "Email or Username already exists",
        user: false,
      });
    }

    // Initialize Twilio client
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated OTP:", otp);
    const mailOptions = {
      from: "mr0248974@gmail.com",
      to: email,
      subject: 'OTP for Sign-Up',
      text: `Your OTP is ${otp}. Use this to verify your account.`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log(error);
          res.status(500).send('Failed to send OTP');
      } else {
          console.log('Email sent: ' + info.response);
          // res.send(`OTP has been sent to ${email}. Use this to verify your account.`);
      }
  });
    // Set OTP expiration time (1 minute)
    const otpExpirationTime = new Date(Date.now() + 1 * 60 * 1000);


    // Store user data in the session
    req.session.tempUser = {
      name,
      username,
      email,
      password: hashedPassword,
      mobile,
      otp,
      otpExpires: otpExpirationTime,
    };

    // Render the page for OTP verification
   
      res.render("client/signup-otp", {
        layout: "layouts/user-layout",
        user: false,
        message: "",
      });
    
   
  } catch (error) {
    console.error("Error in user registration:", error);
    next(error);
  }
};

// Function to create a user in the database
const createUser = async (userData) => {
  try {
    const data = await User.create(userData);
    await data.save();
    return { success: true, message: "Registration Successful" };
  } catch (error) {
    console.log(error.message);
  }
};

// Function to validate OTP
const isValidOTP = (enteredOTP, sessionOTP, otpExpiration) => {
  console.log(enteredOTP, sessionOTP, otpExpiration);
  return (
    enteredOTP.toString().trim().toLowerCase() ===
    sessionOTP.toString().trim().toLowerCase()
  );
};

// Function for OTP verification during signup
const otpSignup = async (req, res) => {
 
  console.log(req.body);
  const { one, two, three, four, five, six } = req.body;
  const enteredOTP = `${one}${two}${three}${four}${five}${six}`;

  const { name, username, email, mobile, password, otp, otpExpires } =   
    req.session.tempUser;

  try {
    if (isValidOTP(enteredOTP, otp, otpExpires)) {
      console.log("OTP verified successfully");
      const registrationData = { name, username, email, mobile, password };
      console.log(registrationData);
      const registrationResult = await createUser(registrationData);    

      if (registrationResult.success) {
        req.session.tempUser = null; // Clear the user data from the session
        req.flash("message", registrationResult.message);
        return res.redirect("/users/login");
      } else {
        throw new Error("Registration failed");
      }
    } else {
      res.render("client/signup-otp", {
        layout: "layouts/user-layout",
        user: false,
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).send("Internal Server Error");
  }

};

const getOtpForm = (req, res) => {
  if (req.session.user) {
    return res.redirect("/users/dashboard");
  }
  res.render("client/otp-login", {
    layout: "layouts/user-layout",
    user: false,
    message: "",
  });
};

const verifyOtp = async (req, res) => {
  try {
    const mobile = req.body.mobile;
    const user = await User.findOne({ mobile: mobile });
    if (user.blocked) {
      return res.render("client/forgot-password", {
        layout: "layouts/user-layout",
        message: "Your account has been blocked",
        user: false,
      });
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);
    const messageData = {
      body: `Your OTP is: ${otp}`,
      to: "+91 " + mobile,
      from: process.env.TWILIO_PHONE_NUMBER,
    };
    client.messages.create(messageData).then(async (message) => {
      const currentTime = new Date();
      const otpExpirationTime = new Date(currentTime.getTime() + 1 * 60 * 1000);
      await User.updateOne(
        {
          mobile: mobile,
        },
        {
          $set: {
            otp: otp,
            otpExpires: otpExpirationTime,
            currentTime: currentTime,
          },
        }
      );
      req.session.otpExpires = otpExpirationTime;
      req.session.currentTime = currentTime;
      req.session.mobile = mobile;

      res.render("client/otp-verification", {
        layout: "layouts/user-layout",
        user: false,
        message: "",
        mobile: mobile,
      });
    });
  } catch (error) {
    console.log(error);
    res.render("client/otp-login", {
      layout: "layouts/user-layout",
      user: false,
      message: "Invalid Mobile Number",
    });
  }
};

const validateOtp = async (req, res) => {
  let OTP = `${req.body.one}${req.body.two}${req.body.three}${req.body.four}${req.body.five}${req.body.six}`;

  const mobile = req.session.mobile;

  try {
    const userData = await User.findOne({ mobile: mobile });

    if (!userData) {
      return res.render("client/otp-verification", {
        layout: "layouts/user-layout",
        user: false,
        message: "User not found",
      });
    }
    console.log(userData);
    let otp = userData.otp;

    let otpIsValid =
      otp.toString().trim().toLowerCase() ===
      OTP.toString().trim().toLowerCase();
    console.log(otpIsValid);

    if (otpIsValid) {
      req.session.user = userData;
      userData.otpExpires = null;
      userData.otp = null;
      userData.currentTime = null;
      await userData.save();
      return res.redirect("/users/dashboard");
    } else {
      return res.render("client/otp-verification", {
        layout: "layouts/user-layout",
        user: false,
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

const getForgotPassword = (req, res) => {
  if (req.session.user) {
    return res.redirect("/users/dashboard");
  }
  res.render("client/forgot-password", {
    layout: "layouts/user-layout",
    message: "",
    user: false,
  });
};

const sendResetLink = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (user.blocked) {
    return res.render("client/forgot-password", {
      layout: "layouts/user-layout",
      message: "Your account has been blocked",
      user: false,
    });
  }

  const token = generateUniqueToken();
  function generateUniqueToken(length = 32) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters.charAt(randomIndex);
    }

    return token;
  }

  const expiration = new Date(Date.now() + 3600000);

  await User.updateOne(
    { email: email },
    { resetPasswordToken: token, resetPasswordExpires: expiration }
  );
  const resetLink = `http://localhost:3000/users/reset/${token}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "mr0248974@gmail.com",
    to: email,
    subject: "Password Reset Request",
    html: `<p>Click the following link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Email could not be sent." });
    }
    console.log("Email sent: " + info.response);
    res.status(200).json({ message: "Email sent successfully." });
  });

  res.render("client/forgot-password", {
    layout: "layouts/user-layout",
    message: "Check your email for a password reset link",
    user: false,
  });
};

const getResetPassword = async (req, res) => {
  const { token } = req.params;

  req.session.token = token;

  const user = await User.findOne({
    resetPasswordToken: token,
  });
  if (!user) {
    return res.send("reset-password-error");
  }

  res.render("client/reset-password", {
    user: false,
    layout: "layouts/user-layout",
    message: "",
  });
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const token = req.session.token;
  try {
    const updateUser = await User.updateOne(
      {
        resetPasswordToken: token,
      },
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        },
      }
    );

    if (updateUser.modifiedCount > 0) {
      return res.render("client/reset-password", {
        layout: "layouts/user-layout",
        user: false,
        message: "Password Reset Successfully",
        token: "",
      });
    } else {
      return res.send("reset-password-error");
    }
  } catch (error) {
    console.error("Error resetting password:", error);

    res.status(500).send("Internal Server Error");
  }
};

const getUserDashboard = async (req, res) => {
  console.log(req.session.user);
  if (!req.session.user) {
    console.log("sdfghj");
    return res.redirect("/users/login");
  }
  try {
    const categoryData = await Category.find();
    const brandData = await Brand.find();

    const categoryIds = categoryData.map((category) => category._id);

    const product = await Product.find({ category: { $in: categoryIds } });

    // Attach products to their respective categories
    categoryData.forEach((category) => {
      category.products = product.filter((p) =>
        p.category.equals(category._id)
      );
    });
    const bannerData = await Banner.find();
   
    if (!req.session.user) {
      return res.render("client/dashboard", {
        layout: "layouts/user-layout",
        user: false,
        categoryData,
        brandData,
        bannerData,
      });
    }
    console.log("sfysdyfs");
    
    console.log(bannerData);
    res.render("client/dashboard", {
      layout: "layouts/user-layout",
      user: true,
      categoryData,
      brandData,
      bannerData,
    });
  } catch (error) {
    console.error(error);
    // Handle error and send an error response if needed.
  }
};

const getUserProfile = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  const user = req.session.user;
  const userData = await User.findOne({ _id: user._id });
  const orders = await Order.find({ userId: user._id });
  const wallet1 = await User.findOne({ _id: user._id }).populate("wallet");
  console.log(wallet1);
  const wallet = wallet1.wallet.transactions;
  const balance = wallet1.wallet.total;
  console.log(balance);

  const message = req.flash("message");

  const renderData = {
    layout: "layouts/user-layout",
    user: true,
    userData,
    message: message || "",
    address: "",
    orders: orders,
    wallet,
    balance,
  };

  res.render("client/accounts", renderData);
};

const profileDetailsPost = async (req, res, next) => {
  const user = req.session.user;
  const { name, username, email, mobile } = req.body;

  const userData = await User.findOne({ _id: user._id });

  if (userData) {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { name, username, email, mobile },
      { new: true }
    );

    if (updatedUser) {
      console.log("User updated:", updatedUser);
      req.flash("message", "Details updated Successfully");
      res.redirect("/users/accounts");
    } else {
      req.flash("message", "Error in updating Details");
      res.redirect("/users/accounts");
    }
  } else {
    req.flash("message", "User not found");
    res.redirect("/users/accounts");
  }
};
const profileImagePost = async (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }
  const user = req.session.user;
  const image = req.file.path;

  const imageUrl = path.relative("src/api/public", image);
  await User.updateOne({ _id: user._id }, { $set: { image: imageUrl } });

  return res.redirect("back");
};

const addressDetailsPost = async (req, res, next) => {

 if(req.query.checkout){
  console.log("dfghjk");
  const { name, address1, address2, city, state, pincode, mobile } = req.body;
  console.log(req.body);
  const userId = req.session.user._id;
  const addressId = req.session.addressId;

  try {
    if (addressId) {
      // Update existing address
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, "address._id": addressId },
        {
          $set: {
            "address.$.name": name,
            "address.$.address1": address1,
            "address.$.address2": address2,
            "address.$.city": city,
            "address.$.state": state,
            "address.$.pincode": pincode,
            "address.$.mobile": mobile,
          },
        },
        { new: true }
      );
      req.session.addressId = false;
      console.log(updatedUser);

      if (updatedUser) {
        return res.redirect("back");
      }
    } else {
      // Add a new address
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            address: {
              name: name,
              address1: address1,
              address2: address2,
              city: city,
              state: state,
              pincode: pincode,
              mobile: mobile,
            },
          },
        },
        { new: true }
      );

      if (updatedUser) {

     return res.json("success")
      }    
    }

    // res.redirect("back");
  } catch (error) {
    console.error("Error:", error);

  }
 }else{



  console.log("aaaaaaaaaaaaaaa");
  const { name, address1, address2, city, state, pincode, mobile } = req.body;
  console.log(req.body);
  const userId = req.session.user._id;
  const addressId = req.session.addressId;

  try {
    if (addressId) {
      // Update existing address
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, "address._id": addressId },
        {
          $set: {
            "address.$.name": name,
            "address.$.address1": address1,
            "address.$.address2": address2,
            "address.$.city": city,
            "address.$.state": state,
            "address.$.pincode": pincode,
            "address.$.mobile": mobile,
          },
        },
        { new: true }
      );
      req.session.addressId = false;
      console.log(updatedUser);

      if (updatedUser) {
        return res.redirect("back");
      }
    } else {
      // Add a new address
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            address: {
              name: name,
              address1: address1,
              address2: address2,
              city: city,
              state: state,
              pincode: pincode,
              mobile: mobile,
            },
          },
        },
        { new: true }
      );

      if (updatedUser) {
        return res.redirect("back");    
      }
    }

    return res.redirect("back");
  } catch (error) {
    console.error("Error:", error);

    return res.redirect("back");
  }
}
};

const getAddress = async (req, res, next) => {
  const userId = req.session.user._id;
  const addressId = req.params.addressId;
  req.session.addressId = addressId;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const address = user.address.id(addressId);

    if (address) {
      // Return the address as JSON data
      return res.json({ address: address });
    } else {
      return res.status(404).json({ error: "Address not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteAddress = async (req, res, next) => {
  const userId = req.session.user._id;
  const addressId = req.params.addressId;
  const deletedAddress = await User.findOneAndUpdate(
    { _id: userId },
    { $pull: { address: { _id: addressId } } },
    { new: true }
  );

  return res.redirect("back");
};

const getBuyNow = async (req, res) => {
  if (!req.session.user) {
    return res.render("client/login", {
      layout: "layouts/user-layout",
      message: "",
      user: false,
    });
  }
  const user = req.session.user;
  const address = await User.findOne({ _id: user._id }, { address: 1, _id: 0 });
  if (req.body.value) {
    console.log("sorry");

   
    const { productId, total, count } = req.body;

    console.log(total);

    console.log(productId);

    req.session.product = {
      productId: productId,
      count: count,
    };
   
const coupons = await Coupon.find()
const balance = await User.findOne({ _id: user._id }).populate("wallet");
    res.render("client/checkout", {
      layout: "layouts/user-layout",
      user: true,
      subtotal: total,
      total,
      address,
      message: "",
      coupons,   
      balance,
    });
  } else {
    if (req.session.product) {
      req.session.product = null;
    }
    // const queryParams = req.query;
    // console.log(queryParams);
    // const additionalData = req.query;
    // console.log(additionalData);
    const cart = await Cart.find({ user: user._id });
    console.log(cart);
    const productIds = req.body['product[]'];

    const quantities =req.body['quantity[]'];

    const productTotal =req.body['productTotal[]'];

    let productsToUpdate;
    if (cart.length < 2) {
      console.log("one");
      productsToUpdate = [
        {
          product: productIds,
          quantity: quantities,
          productTotal: productTotal,
        },
      ];
      console.log(productsToUpdate);
    } else {
      console.log("two");
      productsToUpdate = productIds.map((productId, index) => ({
        product: productId,
        quantity: quantities[index],
        productTotal: productTotal[index],
      }));
    }

    for (const productData of productsToUpdate) {
      const { product, quantity, productTotal } = productData;

      await Cart.findOneAndUpdate(
        { product},
        { $set: { quantity: quantity, price: productTotal } },
        { new: true }
      );
    }

    const total1 = req.body.total;
    const total = parseFloat(total1.replace(/₹/g, ""));
    const subtotal = req.body.total1;
    console.log(total,subtotal); 
    const coupons = await Coupon.find()
    const balance = await User.findOne({ _id: user._id }).populate("wallet");
    res.render("client/checkout", {
      layout: "layouts/user-layout",
      user: true,
      subtotal,
      total,
      address,
      message: "",
      coupons,  
      balance,
    });
  }
};


const userLogout = (req, res) => {
  try {
    req.session.user = null;
    res.clearCookie("sessionId");

    res.redirect("/users/login");
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  getUserSignup,
  registerNewUser,
  userLoginPost,
  getUserLogin,
  getOtpForm,
  verifyOtp,
  validateOtp,
  getForgotPassword,
  sendResetLink,
  getResetPassword,
  resetPassword,
  getUserDashboard,
  getUserProfile,
  profileDetailsPost,
  profileImagePost,
  addressDetailsPost,
  getAddress,
  deleteAddress,
  getBuyNow,
  otpSignup,
  userLogout,
};
