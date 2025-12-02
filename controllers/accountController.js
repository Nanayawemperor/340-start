// needed resources
const utilities = require("../utilities");
const accountModel = require("../models/account_model");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
require('dotenv').config();

/* ****************************************
 *  Deliver login view
 * **************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: [],
  });
}

/* ****************************************
 *  Deliver registration view
 * **************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: [],
  });
}

/* ****************************************
 *  Process Registration
 * **************************************** */
async function registerAccount(req, res, next) {
  try {
    console.log("BODY RECEIVED:", req.body);

    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    // Hash password INSIDE the function
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: []
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: [],
      });
    }
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: [],
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [],
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver Account Management View
 * **************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      messages: req.flash(),
      errors: []
    });
  } catch (err) {
    next(err);
  }
}

async function updateAccount(req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  try {
    const result = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (result) {
      req.flash("notice", "Account information updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Update failed.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    next(error);
  }
}

async function updatePassword(req, res, next) {
  const { account_id, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const result = await accountModel.updatePassword(account_id, hashedPassword);

    if (result) {
      req.flash("notice", "Password updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Password update failed.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    next(error);
  }
}
async function buildUpdateAccount(req, res, next) {
  try {
    const account_id = req.params.account_id;
    const accountData = await accountModel.getAccountById(account_id);
    const nav = await utilities.getNav();

    return res.render("account/update", {
      title: "Update Account Information",
      nav,
      accountData,
      messages: req.flash(),
      errors: []
    });
  } catch (error) {
    next(error);
  }
}



module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildUpdateAccount, buildAccountManagement, updateAccount, updatePassword };