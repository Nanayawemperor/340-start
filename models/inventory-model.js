const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getInventoryByInvId(invId) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory WHERE inv_id = $1`,
      [invId]
    );
    return data.rows[0];
  } catch (error) {
    throw error;
  }
}

async function addClassification(classification_name) {
  try{
    const sql = `INSERT INTO classification (classification_name) VALUES ($1) RETURNING *`;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error('ADD CLASSIFICATION ERROR:', error);
    return null;
  }

}

async function addInventory(inventoryData) {
  try {
    const {
      classification_id, inv_make, inv_model, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
    } = inventoryData;

    const sql = `INSERT INTO inventory (
      classification_id, inv_make, inv_model, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;

    const values = [
      classification_id, inv_make, inv_model, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("addInventory error:", error);
    return null;
  }
}

/* *****************************
 * Update Inventory item
 * **************************** */
async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE inventory
      SET
        inv_make = $2,
        inv_model = $3,
        inv_description = $4,
        inv_image = $5,
        inv_thumbnail = $6,
        inv_price = $7,
        inv_year = $8,
        inv_miles = $9,
        inv_color = $10,
        classification_id = $11
      WHERE inv_id = $1
      RETURNING *;
    `;
    const values = [
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
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("Model error - updateInventory:", error);
    return false;
  }
}

/* ***************************
 * Delete Inventory Item
 *************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data; // data.rowCount tells how many rows were deleted
  } catch (error) {
    console.error("Delete Inventory Error: ", error);
    return 0;
  }
}
  
module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInvId, addClassification, addInventory, updateInventory, deleteInventoryItem};