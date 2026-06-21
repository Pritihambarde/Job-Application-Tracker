const { body, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name is too long'),
  body('email')
    .trim()
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must include at least one number')
    .matches(/[a-zA-Z]/).withMessage('Password must include at least one letter'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
];

const resetPasswordRules = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must include at least one number')
    .matches(/[a-zA-Z]/).withMessage('Password must include at least one letter'),
];

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
