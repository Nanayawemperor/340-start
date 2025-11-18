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

    module.exports = {registerAccount};