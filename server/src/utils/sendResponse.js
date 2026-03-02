/**
 * Standard API response helper.
 * Ensures every endpoint returns the same JSON shape.
 *
 * @param {import("express").Response} res
 * @param {number}  statusCode
 * @param {*}       data        - null for no-data responses (logout, etc.)
 * @param {string}  message
 */
const sendResponse = (res, statusCode, data, message = "success") => {
  const body = { status: "success", message };
  if (data !== null && data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

module.exports = sendResponse;
