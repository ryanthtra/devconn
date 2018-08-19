const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProfileInput(data) {
  let errors = {};

  // In case name is completely blank (thus, technically not an empty string)
  data.handle = !isEmpty(data.handle) ? data.handle : "";
  data.status = !isEmpty(data.status) ? data.status : "";
  data.skills = !isEmpty(data.skills) ? data.skills : "";
  data.website = !isEmpty(data.website) ? data.website : "";
  data.facebook = !isEmpty(data.facebook) ? data.facebook : "";
  data.twitter = !isEmpty(data.twitter) ? data.twitter : "";
  data.youtube = !isEmpty(data.youtube) ? data.youtube : "";
  data.linkedin = !isEmpty(data.linkedin) ? data.linkedin : "";
  data.instagram = !isEmpty(data.instagram) ? data.instagram : "";

  if (!validator.isLength(data.handle, { min: 2, max: 40 })) {
    errors.handle = "Name must be >=2 and <=40 characters!";
  }
  // Validate for required fields
  if (validator.isEmpty(data.handle)) {
    errors.handle = "Profile handle field is required!";
  }
  if (validator.isEmpty(data.status)) {
    errors.status = "Status field is required!";
  }
  if (validator.isEmpty(data.skills)) {
    errors.skills = "Skills field is required!";
  }

  // Validate for non-required fields
  if (!validator.isEmpty(data.website)) {
    if (!validator.isURL(data.website)) {
      errors.website = "Website field not a valid URL!";
    }
  }

  if (!validator.isEmpty(data.facebook)) {
    if (!validator.isURL(data.facebook)) {
      errors.facebook = "facebook field not a valid URL!";
    }
  }
  if (!validator.isEmpty(data.twitter)) {
    if (!validator.isURL(data.twitter)) {
      errors.twitter = "twitter field not a valid URL!";
    }
  }
  if (!validator.isEmpty(data.youtube)) {
    if (!validator.isURL(data.youtube)) {
      errors.youtube = "youtube field not a valid URL!";
    }
  }
  if (!validator.isEmpty(data.linkedin)) {
    if (!validator.isURL(data.linkedin)) {
      errors.linkedin = "linkedin field not a valid URL!";
    }
  }
  if (!validator.isEmpty(data.instagram)) {
    if (!validator.isURL(data.instagram)) {
      errors.instagram = "instagram field not a valid URL!";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
