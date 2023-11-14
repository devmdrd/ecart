const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user-model");
const dotenv = require("dotenv");
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://e-carts.shop/auth/google/callback',
      passReqToCallback: true
    },
    async function(req, accessToken, refreshToken, profile, done) {
      try {
        
        const existingUser = await User.findOne({ email: profile._json.email });
        if (existingUser) {
          console.log("User already exists");
          // Store the user profile in the session
          return done(null, existingUser);
        }
      
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serialize User");
  done(null, user); // Store only the user ID in the session
});

passport.deserializeUser((user, done) => {
    console.log("Deserialize User");
  done(null, user); // Store only the user ID in the session
});


module.exports = passport;
