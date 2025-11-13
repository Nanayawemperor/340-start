const { Pool } = require("pg")
require("dotenv").config()

let pool

// PRODUCTION (Render)
if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Render requires this
    }
  })

  module.exports = pool
}

// DEVELOPMENT (local)
else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL
    // No SSL locally
  })

  // Log queries during development
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        console.log("executed query", { text })
        return res
      } catch (error) {
        console.error("error in query", { text })
        throw error
      }
    }
  }
}
