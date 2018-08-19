const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const is_empty = require("../../../validation/is-empty");

// loading the validator
const validate_profile = require("../../../validation/profile");
const validate_experience = require("../../../validation/experience");
const validate_education = require("../../../validation/education");

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

// @ route    GET api/profile/all
// @ desc     Get all profiles
// @ access   Public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles!";
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err => {
      res.status(404).json({ profile: "There are no profiles!!" });
    });
});

// @ route    GET api/profile/handle/:handle
// @ desc     Get a profile by the handle
// @ access   Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.profile = "There is no profile for this user!";
        return res.status(404).json(errors);
      }
      return res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @ route    GET api/profile/user/:user_id
// @ desc     Get a profile by the user id
// @ access   Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  profile
    .findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.profile = "There is no profile for this user!";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user!!" })
    );
});

// @ route    POST api/profile/experience
// @ desc     Add experience to profile
// @ access   Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Run validator
    const { errors, isValid } = validate_experience(req.body);

    // Return errors if validator fails.
    if (!isValid) {
      return res.status(400).json(errors);
    }

    profile
      .findOne({ user: req.user.id })
      .then(profile => {
        const newXp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        // Add the experience to the array
        profile.experience.unshift(newXp);
        profile.save().then(profile => res.json(profile));
      })
      .catch(err =>
        res.status(404).json({ profile: "There is no profile for this user!!" })
      );
  }
);

// @ route    POST api/profile/education
// @ desc     Add education to profile
// @ access   Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Run validator
    const { errors, isValid } = validate_education(req.body);

    // Return errors if validator fails.
    if (!isValid) {
      return res.status(400).json(errors);
    }

    profile
      .findOne({ user: req.user.id })
      .then(profile => {
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          studyfield: req.body.studyfield,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        // Add the experience to the array
        profile.education.unshift(newEdu);
        profile.save().then(profile => res.json(profile));
      })
      .catch(err =>
        res.status(404).json({ profile: "There is no profile for this user!!" })
      );
  }
);

// @ route    DELETE api/profile/experience/:exp_id
// @ desc     Delete an experience of profile by exp. ID
// @ access   Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    profile
      .findOne({ user: req.user.id })
      .then(profile => {
        // Remove the experience that matches the param id
        profile.experience.remove({ _id: req.params.exp_id });

        profile.save().then(profile => res.json(profile));
      })
      .catch(err =>
        res
          .status(404)
          .json({ experience: "This experience doesn't exist for user!" })
      );
  }
);

// @ route    DELETE api/profile/education/:edu_id
// @ desc     Delete an education of profile by edu. ID
// @ access   Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    profile
      .findOne({ user: req.user.id })
      .then(profile => {
        // Remove the education that matches the param id
        profile.education.remove({ _id: req.params.edu_id });

        profile.save().then(profile => res.json(profile));
      })
      .catch(err =>
        res
          .status(404)
          .json({ education: "This education doesn't exist for user!" })
      );
  }
);

// @ route    DELETE api/profile/
// @ desc     Delete user and profile
// @ access   Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    profile.findOneAndRemove({ user: req.user.id }).then(() => {
      user
        .findOneAndRemove({ _id: req.user.id })
        .then(() => res.json({ success: true }));
    });
  }
);
module.exports = router;
