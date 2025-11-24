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

invCont.buildManagementView = async function (req, res) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash()
    })
  } catch (error) {
    console.error("Error loading management view:", error)
    throw error
  }
}

/* GET - deliver and classification view */
invCont.buildAddClassification = async function (req, res, next) {
  try{
    let nav = await utilities.getNav();
    res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      messages: req.flash(),
    });
  }catch (error){
    next(error);
  }
}

/* POST — process new classification */
invCont.addClassification = async function(req, res, next) {
  try {
    const { classification_name } = req.body;
    const regResult = await invModel.addClassification(classification_name);

    if (regResult) {
      // create fresh nav with new classification included
      let nav = await utilities.getNav();
      req.flash('notice', `Classification "${classification_name}" added successfully.`);
      // render management view with updated nav and message
      return res.status(201).render('inventory/management', {
        title: 'Inventory Management',
        nav,
        messages: req.flash(),
      });
    } else {
      let nav = await utilities.getNav();
      req.flash('notice', 'Sorry, adding the classification failed.');
      return res.status(500).render('inventory/add-classification', {
        title: 'Add Classification',
        nav,
        messages: req.flash(),
        classification_name,
      });
    }
  } catch (error) {
    next(error);
  }
}


invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      messages: req.flash(),
      errors: null
    });
  } catch (error) {
    next(error);
  }
}


invCont.addInventory = async function (req, res, next) {
  try {
    const inventoryData = req.body; // fields names should match DB / form
    const regResult = await invModel.addInventory(inventoryData);

    if (regResult) {
      const nav = await utilities.getNav();
      req.flash('notice', `Inventory "${regResult.inv_make} ${regResult.inv_model}" added successfully.`);
      return res.status(201).render('inventory/management', {
        title: 'Inventory Management',
        nav,
        messages: req.flash()
      });
    } else {
      const nav = await utilities.getNav();
      const classificationList = await utilities.buildClassificationList(req.body.classification_id);
      req.flash('notice', 'Sorry, adding the inventory item failed.');
      return res.status(500).render('inventory/add-inventory', {
        title: 'Add Inventory',
        nav,
        classificationList,
        messages: req.flash(),
        ...req.body
      });
    }
  } catch (error) {
    next(error);
  }
}


module.exports = invCont