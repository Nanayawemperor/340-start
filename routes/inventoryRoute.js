// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Get specific inventory item detail
router.get('/detail/:invId', invController.buildInventoryDetail);

// Footer test link to trigger an error
router.get("/cause-error", (req, res) => {
  throw new Error("");
});

module.exports = router;