import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDb() {
  try {
    const client = await pool.connect();
    console.log("Connected to database successfully!");

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log("\nTables in the database:");
    if (res.rows.length === 0) {
      console.log("No tables found.");
    } else {
      res.rows.forEach((row) => {
        console.log(`- ${row.table_name}`);
      });
    }

    client.release();
  } catch (err) {
    console.error("Error connecting to database:", err);
  } finally {
    await pool.end();
  }
}

checkDb();
