import promisePool from "../database";

async function seed() {
  try {
    // ensure table exists (in case not created yet)
    await promisePool.query(`CREATE TABLE IF NOT EXISTS agents (
      id INT(11) NOT NULL AUTO_INCREMENT,
      agentCode VARCHAR(50) DEFAULT NULL,
      saldo FLOAT NOT NULL DEFAULT 0,
      agentToken VARCHAR(255) NOT NULL,
      secretKey VARCHAR(255) NOT NULL,
      probganho VARCHAR(50) DEFAULT '0',
      probbonus VARCHAR(10) DEFAULT '0',
      probganhortp VARCHAR(10) DEFAULT '0',
      probganhoinfluencer VARCHAR(10) DEFAULT '0',
      probbonusinfluencer VARCHAR(10) DEFAULT '0',
      probganhoaposta VARCHAR(10) DEFAULT '0',
      probganhosaldo VARCHAR(10) DEFAULT '0',
      callbackurl VARCHAR(255) DEFAULT NULL,
      PRIMARY KEY (id),
      KEY id_idx (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`);

    const [rows]: any = await promisePool.query("SELECT * FROM agents WHERE agentToken = ? AND secretKey = ?", ["test", "test"]);
    if (!rows || rows.length === 0) {
      await promisePool.query(
        "INSERT INTO agents(agentCode, saldo, agentToken, secretKey, callbackurl) VALUES (?,?,?,?,?)",
        ["AG001", 1000, "test", "test", "https://example.com/"]
      );
      console.log("Inserted default agent (agentToken=test, secretKey=test)");
    } else {
      console.log("Agent already exists");
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  process.exit(0);
}

seed();