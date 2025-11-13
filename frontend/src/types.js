// Type definitions converted to JSDoc comments for JavaScript

/**
 * @typedef {Object} CostItem
 * @property {string} id
 * @property {number} amount
 * @property {string} detail
 */

/**
 * @typedef {Object} Destination
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {CostItem[]} costs
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} DayPlan
 * @property {string} id
 * @property {number} dayNumber
 * @property {Destination[]} destinations
 * @property {Destination[]} optimizedRoute
 */

export {};
