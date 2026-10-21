const { body, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

// Names: letters (any language), spaces, hyphens, apostrophes and periods. No digits or symbols.
const NAME_PATTERN = /^\p{L}[\p{L}\s.'’-]*$/u;

// Reusable strong-password chain (used for register and reset).
// 72 is bcrypt's input limit — anything longer is silently truncated, so we reject it.
const strongPassword = () =>
  body('password')
    .isString().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isLength({ max: 72 }).withMessage('Password must be 72 characters or fewer')
    .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
    .matches(/\d/).withMessage('Password must include a number')
    .matches(/[^A-Za-z0-9\s]/).withMessage('Password must include a special character (e.g. ! @ # $ %)');

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters')
    .matches(NAME_PATTERN).withMessage('Name can only contain letters, spaces, hyphens, apostrophes and periods (no numbers)'),
  body('email')
    .trim()
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),
  strongPassword(),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
];

const resetPasswordRules = [strongPassword()];

const jobRules = [
  body('company').trim().notEmpty().withMessage('Company is required').isLength({ max: 200 }),
  body('role').trim().notEmpty().withMessage('Role is required').isLength({ max: 200 }),
  body('status').optional().isIn(['Applied', 'Interviewing', 'Offer', 'Rejected']).withMessage('Invalid status'),
  body('link').optional({ checkFalsy: true }).isURL().withMessage('Listing link must be a valid URL'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('Notes are too long'),
];

// Same fields, but every one is optional — used for PATCH-style partial updates
const jobUpdateRules = [
  body('company').optional().trim().notEmpty().withMessage('Company cannot be empty').isLength({ max: 200 }),
  body('role').optional().trim().notEmpty().withMessage('Role cannot be empty').isLength({ max: 200 }),
  body('status').optional().isIn(['Applied', 'Interviewing', 'Offer', 'Rejected']).withMessage('Invalid status'),
  body('link').optional({ checkFalsy: true }).isURL().withMessage('Listing link must be a valid URL'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('Notes are too long'),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  jobRules,
  jobUpdateRules,
};
