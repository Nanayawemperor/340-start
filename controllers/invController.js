const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    // route uses :classificationId (camelCase) for the classification page
    const classification_id = parseInt(req.params.classificationId, 10);
    const data = await invModel.getInventoryByClassificationId(classification_id);

    // if no data, render a friendly message
    if (!data || data.length === 0) {
      const nav = await utilities.getNav();
      return res.status(404).render("inventory/classification", {
        title: "No Vehicles Found",
        nav,
        grid: "<p class='notice'>Sorry, no matching vehicles could be found.</p>",
      });
    }

    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;

    res.render("inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildInventoryDetail = async function (req, res, next) {
  try {
    const invId = parseInt(req.params.invId, 10);
    const vehicleData = await invModel.getInventoryByInvId(invId);

    const nav = await utilities.getNav();

    if (!vehicleData) {
      return res.status(404).render("inventory/detail", {
        title: "Vehicle Not Found",
        nav,
        itemView: "<p class='notice'>Sorry, this vehicle does not exist.</p>",
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
};

/* ***************************
 *  Build Inventory Management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList, // THIS is used by the EJS to render the <select>
      messages: req.flash(),
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build Add Classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process new classification (POST)
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    const regResult = await invModel.addClassification(classification_name);

    if (regResult) {
      const nav = await utilities.getNav();
      req.flash("notice", `Classification "${classification_name}" added successfully.`);
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        classificationList: await utilities.buildClassificationList(),
        messages: req.flash(),
      });
    }

    const nav = await utilities.getNav();
    req.flash("notice", "Sorry, adding the classification failed.");
    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
      classification_name,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build Add Inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      messages: req.flash(),
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process Add Inventory (POST)
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const inventoryData = req.body; // expects fields matching DB names
    const regResult = await invModel.addInventory(inventoryData);

    if (regResult) {
      const nav = await utilities.getNav();
      req.flash("notice", `Inventory added successfully.`);
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        classificationList: await utilities.buildClassificationList(),
        messages: req.flash(),
      });
    }

    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    req.flash("notice", "Sorry, adding the inventory item failed.");
    return res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      messages: req.flash(),
      ...req.body,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 *  Route: GET /inv/getInventory/:classification_id
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id, 10);
    const invData = await invModel.getInventoryByClassificationId(classification_id);

    if (invData && invData.length > 0) {
      return res.json(invData);
    } else {
      // return empty array instead of error (frontend can handle empty)
      return res.json([]);
    }
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build the Edit Inventory View
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  try {
    const invId = req.params.invId;
    const itemData = await invModel.getInventoryByInvId(invId);

    if (!itemData) {
      req.flash("notice", "Inventory item not found.");
      return res.redirect("/inv/management");
    }

    const classificationList = await utilities.buildClassificationList(itemData.classification_id);
    const nav = await utilities.getNav();

    res.render("inventory/edit-inventory", {
      title: `Edit ${itemData.inv_make} ${itemData.inv_model}`,
      nav,
      classificationList, // this is the <option> HTML
      itemData,           // always pass itemData
      messages: req.flash(),
      errors: null,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    const nav = await utilities.getNav();

    if (updateResult) {
      const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
      req.flash("notice", `The ${itemName} was successfully updated.`);
      return res.redirect("/inv/"); // redirect to management view
    } else {
      const itemData = {  // build itemData from POSTed values
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
      };

      const classificationList = await utilities.buildClassificationList(classification_id);

      req.flash("notice", "Sorry, the update failed.");

      return res.status(500).render("inventory/edit-inventory", {
        title: `Edit ${inv_make} ${inv_model}`,
        nav,
        itemData,            // <-- PASS itemData here
        classificationList,  // <-- HTML <option> list
        messages: req.flash(),
        errors: null,
      });
    }
  } catch (error) {
    next(error);
  }
};

invCont.buildDeleteInventoryView = async function (req, res, next) {
  try {
    const invId = req.params.invId;
    const itemData = await invModel.getInventoryByInvId(invId);

    if (!itemData) {
      req.flash("notice", "Inventory item not found.");
      return res.redirect("/inv/management");
    }

    const nav = await utilities.getNav();
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("inventory/delete-confirm", {
      title: `Delete ${itemName}`,
      nav,
      itemData,
      messages: req.flash(),
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id, 10);
    const deleteResult = await invModel.deleteInventoryItem(inv_id);

    if (deleteResult.rowCount) {
      req.flash("notice", "Inventory item successfully deleted.");
      return res.redirect("/inv/management");
    } else {
      req.flash("notice", "Delete failed. Try again.");
      return res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    next(error);
  }
};


module.exports = invCont;
