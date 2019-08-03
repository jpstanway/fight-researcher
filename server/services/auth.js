const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = mongoose.model("User");

// Sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Authentication
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: "Invalid email" });
      }
      user.comparePassword(password, (err, isMatch) => {
        if (err) return done(err);
        if (isMatch) {
          return done(null, user);
        }
        return done(null, false, { message: "Incorrect password" });
      });
    });
  })
);

// Signup + Login
function signup({ email, password, req }) {
  const user = new User({ email, password });
  if (!email || !password)
    throw new Error("You must provide and email and password");

  return User.findOne({ email })
    .then(existingUser => {
      if (existingUser) throw new Error("Email is already in use");
      return user.save();
    })
    .then(user => {
      return new Promise((resolve, reject) => {
        req.login(user, err => {
          if (err) reject(err);
          resolve(user);
        });
      });
    });
}

function login({ email, password, req }) {
  return new Promise((resolve, reject) => {
    passport.authenticate("local", (err, user) => {
      if (!user) reject("Invalid credentials");
      req.login(user, () => resolve(user));
    })({ body: { email, password } });
  });
}

module.exports = { signup, login };
