// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const accountValidate = require('../utilities/account-validation'); 


// Route to build the My Account view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build the Registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Account management View
router.get(
    '/',
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountManagement)
)

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('sessionId');
  req.flash('notice', 'You have successfully logged out.');
  res.redirect('/');
});

module.exports = router;