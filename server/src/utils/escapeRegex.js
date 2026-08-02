// Escapes regex special characters in user-supplied search strings before
// they're used in a MongoDB $regex query — prevents ReDoS and unintended
// pattern matching from untrusted input.
const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = escapeRegex;
