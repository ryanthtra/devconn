// Checks to see if argument is a zero value
const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) || // Object with no props
  (typeof value === "string" && value.trim().length === 0); // String with no length

module.exports = isEmpty;
