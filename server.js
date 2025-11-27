/* ***********************
 * Require Statements
 *************************/
const baseController = require('./controllers/baseController')
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const inventoryRoute = require('./routes/inventoryRoute')
const env = require("dotenv").config()
const app = express()
const staticRoutes = require("./routes/static")
const utilities = require('./utilities/')
const path = require('path')
const session = require("express-session")
const pool = require("./database/")
const accountRoute = require("./routes/accountRoute")
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

/* ***********************
 * Body Parsers FIRST
 *************************/

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine
 *************************/
app.set("view engine", "ejs")
app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts)
app.set('layout', './layouts/layout')

/* ***********************
 * Sessions SECOND
 *************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
  })
)

/* ***********************
 * Flash THIRD
 *************************/
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * Routes - AFTER sessions & flash
 *************************/
app.use("/account", accountRoute)
app.use("/inv", inventoryRoute)
app.use(staticRoutes)

// Homepage
app.get("/", utilities.handleErrors(baseController.buildHome))

/* ***********************
 * File Not Found Route
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav,
  })
})

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT
const host = process.env.HOST

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
