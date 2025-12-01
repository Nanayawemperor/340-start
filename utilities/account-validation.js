const utilities = require(".");

const { body, validationResult } = require('express-validator');

const accountModel = require("../models/account_model");

const validate = {};

/* **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
    return [
        //firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2})
            .withMessage("Please provide a first name"),

            //lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2})
            .withMessage("Please provide a last name"),

         // valid email is required
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists){
      throw new Error("Email exists. Please log in or use different email")
    }
      
    }),
    // password is required and must be strong
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* **********************************
 *  Check for validation errors
 * ********************************* */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/register", {
      errors: errors.array(), // <-- convert to array
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
  next();
}


validate.loginRules = () => {
  return [
    body('account_email')
    .trim()
    .escape()
    .notEmpty()
    .isEmail()
    .withMessage('Please enter a valid email address.'),

    body('account_password')
    .trim()
    .notEmpty()
    .withMessage('Please enter your password.')

  ];
}

/* *******************************
 *  Check Login Data
 ******************************** */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();

    // return with sticky email
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: req.body.account_email
    });
  }
  next();
};

validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required."),

    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required."),

    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required.")
  ];
};

validate.checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();

    return res.status(400).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      messages: req.flash(),
      accountData: {
        account_id: req.body.account_id,
        account_firstname: req.body.account_firstname,
        account_lastname: req.body.account_lastname,
        account_email: req.body.account_email
      }
    });
  }

  next();
};


validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
      .withMessage("Password does not meet requirements.")
  ];
};

validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const accountData = await accountModel.getAccountById(req.body.account_id);
    const nav = await utilities.getNav();
    
    return res.status(400).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      messages: req.flash(),
      accountData
    });
  }
  next();
};


module.exports = validate