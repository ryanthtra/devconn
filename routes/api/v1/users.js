const express = require("express");
const router = express.Router();
const gravatar = require("gravatar"); // For getting Gravatar avatar
const bcrypt = require("bcryptjs"); // For encrypting/decrypting password
const jwt = require("jsonwebtoken"); // For creating session token
const keys = require("../../../config/keys"); // File that holds some secret keys
const passport = require("passport"); // For implementing jwt authorization

// Loading validator
const validate_register = require("../../../validation/register");
const validate_login = require("../../../validation/login");

// Load User model
const User = require("../../../models/User");

// @route     GET api/users/test
// @ desc     Tests post route
// @ access   Public
router.get("/test", (req, res) => res.json({ msg: "Users works!" }));

// @route     GET api/users/register
// @ desc     Registers (creates) a user
// @ access   Public
router.post("/register", (req, res) => {
  // Run the validator first...
  const { errors, isValid } = validate_register(req.body);

  // Checking results of the validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Find if user with this email already exists
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists!" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", // size
        r: "pg", // rating
        d: "mm" // default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;

          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route     GET api/users/login
// @ desc     Logs in a user
// @ access   Public
router.post("/login", (req, res) => {
  // Run the validator first...
  const { errors, isValid } = validate_login(req.body);

  // Checking results of the validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Look for User in db
  User.findOne({ email }).then(user => {
    // Check for user
    if (!user) {
      errors.password = "Email and password combination is incorrect!";
      return res.status(404).json(errors);
    }

    // Check the pw
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // Correct pw and user matched

        // Create token payload
        const payload = { id: user.id, name: user.name, avatar: user.avatar };
        // Sign the token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            // The callback function
            res.json({ success: true, token: `Bearer ${token}` });
          }
        );
      } else {
        errors.password = "Email and password combination is incorrect!";
        return res.status(400).json(errors);
      }
    });
  });
});

// @ route    GET api/users/current
// @ desc     Returns the current user
// @ access   Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
