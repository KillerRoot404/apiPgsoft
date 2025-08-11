import promisePool from "../database";

async function ensureTables() {
  const queries: string[] = [
    `CREATE TABLE IF NOT EXISTS agents (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,
    `CREATE TABLE IF NOT EXISTS users (
      id INT(11) NOT NULL AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL,
      token VARCHAR(255) NOT NULL DEFAULT '',
      atk VARCHAR(255) NOT NULL,
      saldo FLOAT NOT NULL DEFAULT 0,
      valorapostado FLOAT NOT NULL DEFAULT 0,
      valordebitado FLOAT NOT NULL DEFAULT 0,
      valorganho FLOAT NOT NULL DEFAULT 0,
      rtp DOUBLE NOT NULL DEFAULT 0,
      isinfluencer FLOAT NOT NULL DEFAULT 0,
      agentid INT(11) NOT NULL,
      PRIMARY KEY (id),
      KEY id_idx (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`
  ];

  for (const sql of queries) {
    await promisePool.query(sql);
  }
}

ensureTables()
  .then(async () => {
    console.log("OK: Tables ensured (agents, users)");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAIL: ", err);
    process.exit(1);
  });