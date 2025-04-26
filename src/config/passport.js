const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../api/models/user");
require("dotenv").config();

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser((id, done) =>
  User.findById(id).then(user => done(null, user)).catch(err => done(err))
);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
}, async (_, __, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const existingUser = await User.findOne({ email });

    if (existingUser) return done(null, existingUser);

    const newUser = await User.create({
      name: profile.displayName,
      email,
      username: `${profile.displayName.replace(/\s+/g, '').toLowerCase()}${Date.now()}`,
      password: "",
      phone: "",
      profileImage: profile.photos?.[0]?.value || ""
    });

    done(null, newUser);
  } catch (err) {
    done(err);
  }
}));
