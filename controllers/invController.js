const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildInventoryDetail = async function (req, res, next) {
  try {
    const invId = req.params.invId;
    const vehicleData = await invModel.getInventoryByInvId(invId);

    const nav = await utilities.getNav(); 
     
    if (!vehicleData) {
      return res.status(404).render("inventory/detail", {
        title: "Vehicle Not Found",
        nav,
        itemView: "<p class='notice'>Sorry, this vehicle does not exist.</p>"
      });
    }

    const itemView = await utilities.buildInventoryDetailView(vehicleData);

    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      itemView,
    });

  } catch (error) {
    next(error);
  }
}


module.exports = invCont