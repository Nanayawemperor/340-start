// utilities/inv-validation.js
const utilities = require('.');
const { body, validationResult } = require('express-validator');

const invModel = require('../models/inventory-model');
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


validate.inventoryRules = () =>{
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please select a classification."),
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Make."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Model."),
    body("inv_year")
      .trim()
      .notEmpty()
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Please provide a valid Year."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Description."),
    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid Price."),
    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide valid Miles."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Color."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path."),
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

/* **********************************
 * Check Inventory Data (for ADD)
 * If errors -> render add-inventory view
 * *********************************/
validate.checkInventoryData = async (req, res, next) => {
  try {
    const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav();
      const classificationList = await utilities.buildClassificationList(classification_id);
      return res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: errors.array(),
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

/* **********************************
 * Check Inventory Data (for UPDATE)
 * If errors -> render edit-inventory view and keep inv_id sticky
 * *********************************/
validate.checkUpdateData = async (req, res, next) => {
  try {
    const {
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav();
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      const itemName = `${inv_make || ""} ${inv_model || ""}`.trim();
      return res.status(400).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: errors.array(),
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
