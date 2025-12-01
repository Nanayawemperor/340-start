const pool = require("../database/")

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try{
        const sql =  `
      INSERT INTO account 
      (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING *
    `;
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password
    ]);
    console.log("INSERT RESULT:", result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return null;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function updateAccount(account_id, firstname, lastname, email) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1, account_lastname = $2, account_email = $3
      WHERE account_id = $4
      RETURNING *
    `;
    const data = await pool.query(sql, [firstname, lastname, email, account_id]);
    return data.rows[0];
  } catch (error) {
    console.error("Account update error:", error);
    return null;
  }
}

async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING account_id
    `;
    const data = await pool.query(sql, [hashedPassword, account_id]);
    return data.rows[0];
  } catch (error) {
    console.error("Password update error:", error);
    return null;
  }
}



    module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, updateAccount, updatePassword};