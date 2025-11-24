// utilities/inv-validation.js
const utilities = require('.');
const { body, validationResult } = require('express-validator');

const validate = {};

/* Validation rules for adding a classification */
validate.classificationRules = () => {
  return [
    body('classification_name')
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1, max: 50 })
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage('Classification name is required and must contain only letters and numbers (no spaces or special characters).'),
  ];
};

/* Check the validation result */
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.status(400).render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: errors.array(),
      classification_name: req.body.classification_name,
      messages: req.flash(),
    });
  }
  next();
};

module.exports = validate;
