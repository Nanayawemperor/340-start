const invModel = require("../models/inventory-model")
const jwt = require('jsonwebtoken')
require('dotenv').config()
const Util = {}


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

  Util.buildInventoryDetailView = async function (vehicle) {
    const price = vehicle.inv_price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });

    const mileage = vehicle.inv_miles.toLocaleString("en-US");

    return `
      <section class="vehicle-detail">
        <img src="${vehicle.inv_image}" alt="Picture of ${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-detail-img">

        <div class="vehicle-info">
          <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
          <p><strong>Description:</strong> ${vehicle.inv_description}</p>
          <p><strong>Color:</strong> ${vehicle.inv_color}</p>
          <p><strong>Mileage:</strong> ${mileage} miles</p>
          <p><strong>Price:</strong> ${price}</p>
        </div>
      </section>
    `;
  };

  Util.buildClassificationList = async function(selectedId = null) {
  const data = await invModel.getClassifications(); // should return { rows: [...] }
  let classificationList = '';
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"${selectedId && row.classification_id == selectedId ? ' selected' : ''}>${row.classification_name}</option>`;
  });
  return classificationList;
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  // Default values for views
  res.locals.loggedin = false
  res.locals.accountData = null

  const token = req.cookies.jwt
  if (!token) {
    return next()
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
      if (err) {
        // Token invalid → treat as logged out
        res.locals.loggedin = false
        res.locals.accountData = null
        res.clearCookie("jwt")
        return next()
      }

      // ⭐ Logged in — save data for use in header.ejs
      res.locals.loggedin = true
      res.locals.accountData = accountData
      next()
    }
  )
}


/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /* ****************************************
 *  Check Account Type (Employee or Admin)
 * ************************************ */
Util.checkEmployeeOrAdmin = (req, res, next) => {
  // user must be logged in and token must have account_type
  const account = res.locals.accountData;

  if (!account) {
    req.flash("notice", "You must be logged in to access this page.");
    return res.redirect("/account/login");
  }

  const allowed = ["Employee", "Admin"];

  if (!allowed.includes(account.account_type)) {
    req.flash("notice", "You do not have permission to access this resource.");
    return res.redirect("/account/login");
  }

  next();
};


module.exports = Util