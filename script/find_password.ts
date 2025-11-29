import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const passwordsToTry = [
  "postgres",
  "admin",
  "root",
  "password",
  "1234",
  "123456",
  "friendnetmap",
  "", // empty password
];

async function tryConnect() {
  console.log("Trying to find the correct password for user 'postgres'...");

  for (const password of passwordsToTry) {
    const connectionString = `postgresql://postgres:${password}@localhost:5432/postgres`; // Try connecting to default 'postgres' db first

    const pool = new Pool({
      connectionString: connectionString,
      connectionTimeoutMillis: 2000,
    });

    try {
      const client = await pool.connect();
      console.log(`\nSUCCESS! The password is: '${password}'`);
      console.log(`Connection string: ${connectionString}`);
      client.release();
      await pool.end();
      return;
    } catch (err: any) {
      process.stdout.write("."); // Progress indicator
      // console.log(`Failed with '${password}': ${err.message}`);
    } finally {
      // await pool.end(); // Pool might be closed in try block
    }
  }

  console.log("\n\nCould not find the password in the common list.");
  console.log(
    "You might need to reinstall PostgreSQL or use a cloud database like Neon."
  );
}

tryConnect();
