/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const baseController = require('./controllers/baseController')
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
// Require Statements
const inventoryRoute = require('./routes/inventoryRoute');
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const utilities = require('./utilities')
const path = require('path')

/* ***********************
 *  View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts)
app.set('layout', './layouts/layout') //not at views root
/* ***********************
 * Routes
 *************************/
app.use(require('./routes/static'))

//index route
app.get('/', utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use('/inv', inventoryRoute);
app.use(static)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("errors/404", {
    title: "Page Not Found",
    nav: "<a href='/'>Home</a>",
    message: "Sorry, the page you requested could not be found."
  });
});

// General error handler
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).render("errors/500", {
    message: "", // optional debug info; leave blank for users
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
