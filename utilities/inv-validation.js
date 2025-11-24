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


validate.inventoryRules = () => {
  return [
    body("classification_id").trim().notEmpty().withMessage("Please choose a classification."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1900, max: 2099 }).withMessage("Please enter a valid year."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a non-negative integer."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  ];
};

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body,
      messages: req.flash(),
    });
  }
  next();
};

module.exports = validate;
