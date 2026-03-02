/**
 * Pagination helper — call once, reuse everywhere.
 * Caps limit at 50 to prevent DB overload.
 *
 * @param {number|string} page   - current page (1-based)
 * @param {number|string} limit  - items per page
 * @returns {{ skip: number, limit: number, page: number }}
 */
const paginate = (page = 1, limit = 10) => {
  const p = Math.max(Number(page)  || 1,  1);
  const l = Math.min(Number(limit) || 10, 50);
  return {
    skip:  (p - 1) * l,
    limit: l,
    page:  p,
  };
};

module.exports = paginate;
