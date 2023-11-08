const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,   
  },
  mobile: {
    type: Number,
    required: true,    
    // unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
    default: "",
  },
  resetPasswordExpires: {
    type: Date,
    default: "",
  },
  otp: {
    type: Number,
    default: "",
  },
  otpExpires: {
    type: Date,
    default: "",
  },
  currentTime: {
    type: Date,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  address: [
    {
      name: {
        type: String,
        default: "",
      },

      pincode: {
        type: Number,
        default: "",
      },
      address1: {
        type: String,
        default: "",
      },
      address2: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
      mobile: {
        type: Number,
        default: "",
      },
    },
  ],
  wallet: {
    total: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          default: "",
        },
        
        person: {
          type: String,
          default: "",
        },
        amount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
