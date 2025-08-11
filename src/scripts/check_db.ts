import promisePool from "../database";

async function run() {
  try {
    const [rows] = await promisePool.query<any[]>("SHOW TABLES");
    console.log("SHOW TABLES:", rows);
    const [dbNameRows] = await promisePool.query<any[]>("SELECT DATABASE() as db");
    console.log("Current DB:", dbNameRows);
    try {
      const [descAgents] = await promisePool.query<any[]>("DESCRIBE agents");
      console.log("DESCRIBE agents:", descAgents);
    } catch (e:any) {
      console.error("DESCRIBE agents failed:", e.code, e.sqlMessage);
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();