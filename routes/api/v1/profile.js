const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// loading the validator
const validate_profile = require("../../../validation/profile");

const profile = require("../../../models/Profile");
const user = require("../../../models/User");

// @route     GET api/profile/test
// @ desc     Tests post route
// @ access   Public
router.get("/test", (req, res) => res.json({ msg: "Profile works!" }));

// @route     GET api/profile
// @ desc     Get profile of current (logged-in) user
// @ access   Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }), // Token contains user model
  (req, res) => {
    const errors = {};
    profile
      .findOne({ user: req.user.id }) // Finds the user from token (req)
      .populate("user", ["name", "avatar"]) // Populates user object with the model's other props.
      .then(profile => {
        if (!profile) {
          errors.noprofile = "This user has no profile!";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @ route     POST api/profile
// @ desc     Create/edit profile for current (logged-in) user
// @ access   Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }), // Token contains user model
  (req, res) => {
    // Run validator
    const { errors, isValid } = validate_profile(req.body);

    // Return errors if validator fails.
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Get all the fields
    const profile_fields = {};
    profile_fields.user = req.user.id;
    if (req.body.handle) profile_fields.handle = req.body.handle;
    if (req.body.company) profile_fields.company = req.body.company;
    if (req.body.website) profile_fields.website = req.body.website;
    if (req.body.location) profile_fields.location = req.body.location;
    if (req.body.status) profile_fields.status = req.body.status;
    if (req.body.bio) profile_fields.bio = req.body.bio;
    if (req.body.githubname) profile_fields.githubname = req.body.githubname;
    // Skills array
    if (typeof req.body.skills !== "undefined") {
      // req.body.skills will be a CSV
      profile_fields.skills = req.body.skills.split(",");
    }
    // Social network urls
    profile_fields.social = {};
    if (req.body.facebook) profile_fields.social.facebook = req.body.facebook;
    if (req.body.twitter) profile_fields.social.twitter = req.body.twitter;
    if (req.body.youtube) profile_fields.social.youtube = req.body.youtube;
    if (req.body.linkedin) profile_fields.social.linkedin = req.body.linkedin;
    if (req.body.instagram)
      profile_fields.social.instagram = req.body.instagram;

    profile.findOne({ user: req.user.id }).then(theprofile => {
      // Found a profile for this user -- so update
      if (theprofile) {
        profile
          .findOneAndUpdate(
            { user: req.user.id },
            { $set: profile_fields },
            { new: true }
          )
          .then(theprofile => res.json(theprofile));
      } else {
        // Did not find a profile -- so create one
        // Check for handle
        profile.findOne({ handle: profile_fields.handle }).then(theprofile => {
          if (theprofile) {
            errors.handle = "That handle already exists!";
            res.status(400).json(errors);
          }
        });

        // Save Profile
        new profile(profile_fields)
          .save()
          .then(newprofile => res.json(newprofile));
      }
    });
  }
);
module.exports = router;
