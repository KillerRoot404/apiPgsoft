import promisePool from "../database";

async function ensureFullSchema() {
  const statements: string[] = [
    // agents
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
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    // users
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
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    // calls
    `CREATE TABLE IF NOT EXISTS calls (
      id INT(11) NOT NULL AUTO_INCREMENT,
      iduser INT(11) NOT NULL,
      gamecode VARCHAR(255) NOT NULL,
      jsonname VARCHAR(255) NOT NULL DEFAULT '0',
      steps INT(11) DEFAULT NULL,
      bycall VARCHAR(255) DEFAULT NULL,
      aw FLOAT DEFAULT 0,
      status VARCHAR(255) NOT NULL DEFAULT 'pending',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    // JSON tables (only id + json column with default content copied from dump)
    `CREATE TABLE IF NOT EXISTS fortunetigerplayerjson (
      id INT(11) NOT NULL,
      json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{"dt":{"si":{"wc":31,"ist":false,"itw":true,"fws":0,"wp":null,"orl":[5,7,6,5,6,3,3,7,6],"lw":null,"irs":false,"gwt":-1,"fb":null,"ctw":0,"pmt":null,"cwc":0,"fstc":null,"pcwc":0,"rwsp":null,"hashr":"0:2;5;4#3;3;6#7;3;6#MV#3.0#MT#1#MG#0#","ml":"1","cs":"0.08","rl":[5,7,6,5,6,3,3,7,6],"sid":"1758600495495052800","psid":"1758600495495052800","st":1,"nst":1,"pf":1,"aw":0,"wid":0,"wt":"C","wk":"0_C","wbn":null,"wfg":null,"blb":44409,"blab":44408.6,"bl":44408.6,"tb":0.4,"tbb":0.4,"tw":0,"np":-0.4,"ocr":null,"mr":null,"ge":[1,11]}},"err":null}',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    `CREATE TABLE IF NOT EXISTS fortuneoxrplayerjson (
      id INT(11) NOT NULL,
      json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{"dt":{"si":{"wc":31,"ist":false,"itw":true,"fws":0,"wp":null,"orl":[5,7,6,5,6,3,3,7,6],"lw":null,"irs":false,"gwt":-1,"fb":null,"ctw":0,"pmt":null,"cwc":0,"fstc":null,"pcwc":0,"rwsp":null,"hashr":"0:2;5;4#3;3;6#7;3;6#MV#3.0#MT#1#MG#0#","ml":"1","cs":"0.08","rl":[5,7,6,5,6,3,3,7,6],"sid":"1758600495495052800","psid":"1758600495495052800","st":1,"nst":1,"pf":1,"aw":0,"wid":0,"wt":"C","wk":"0_C","wbn":null,"wfg":null,"blb":44409,"blab":44408.6,"bl":44408.6,"tb":0.4,"tbb":0.4,"tw":0,"np":-0.4,"ocr":null,"mr":null,"ge":[1,11]}},"err":null}',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    `CREATE TABLE IF NOT EXISTS fortunemouseplayerjson (
      id INT(11) NOT NULL,
      json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{"dt":{"si":{"wp":null,"lw":null,"orl":null,"idr":false,"ir":false,"ist":false,"rc":0,"itw":false,"wc":0,"gwt":0,"fb":null,"ctw":0.0,"pmt":null,"cwc":0,"fstc":null,"pcwc":0,"rwsp":null,"hashr":null,"ml":2,"cs":0.3,"rl":[1,1,1,0,0,0,2,2,2],"sid":"0","psid":"0","st":1,"nst":1,"pf":0,"aw":0.00,"wid":0,"wt":"C","wk":"0_C","wbn":null,"wfg":null,"blb":0.00,"blab":0.00,"bl":100000.00,"tb":0.00,"tbb":0.00,"tw":0.00,"np":0.00,"ocr":null,"mr":null,"ge":null}},"err":null}',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    `CREATE TABLE IF NOT EXISTS fortunedragonplayerjson (
      id INT(11) NOT NULL,
      json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{"dt":{"si":{"wp":null,"lw":null,"gm":1,"it":false,"orl":[2,2,5,0,0,0,6,3,3],"fs":null,"mf":{"mt":[2],"ms":[true],"mi":[0]},"ssaw":0.00,"crtw":0.0,"imw":false,"gwt":0,"fb":null,"ctw":0.0,"pmt":null,"cwc":0,"fstc":null,"pcwc":0,"rwsp":null,"hashr":null,"ml":2,"cs":0.3,"rl":[2,2,5,0,0,0,6,3,3],"sid":"0","psid":"0","st":1,"nst":1,"pf":0,"aw":0.00,"wid":0,"wt":"C","wk":"0_C","wbn":null,"wfg":null,"blb":0.00,"blab":0.00,"bl":100000.00,"tb":0.00,"tbb":0.00,"tw":0.00,"np":0.00,"ocr":null,"mr":null,"ge":null}},"err":null}',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    `CREATE TABLE IF NOT EXISTS fortunerabbitplayerjson (
      id INT(11) NOT NULL,
      json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{"dt":{"si":{"wp":null,"lw":null,"orl":[2,2,0,99,8,8,8,8,2,2,0,99],"ift":false,"iff":false,"cpf":{"1":{"p":4,"bv":3000.00,"m":500.0},"2":{"p":5,"bv":120.00,"m":20.0},"3":{"p":6,"bv":30.00,"m":5.0},"4":{"p":7,"bv":3.00,"m":0.5}},"cptw":0.0,"crtw":0.0,"imw":false,"fs":null,"gwt":0,"fb":null,"ctw":0.0,"pmt":null,"cwc":0,"fstc":null,"pcwc":0,"rwsp":null,"hashr":null,"ml":2,"cs":0.3,"rl":[2,2,0,99,8,8,8,8,2,2,0,99],"sid":"0","psid":"0","st":1,"nst":1,"pf":0,"aw":0.00,"wid":0,"wt":"C","wk":"0_C","wbn":null,"wfg":null,"blb":0.00,"blab":0.00,"bl":100000.00,"tb":0.00,"tbb":0.00,"tw":0.00,"np":0.00,"ocr":null,"mr":null,"ge":null},"cc":"PGC"},"err":null}',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    `CREATE TABLE IF NOT EXISTS jungledelightjson (
      id INT(10) NOT NULL,
      json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{"dt":{"si":{"wp":null,"lw":null,"c":null,"orl":null,"fs":null,"gwt":0,"fb":null,"ctw":0.0,"pmt":null,"cwc":0,"fstc":null,"pcwc":0,"rwsp":null,"hashr":null,"ml":1,"cs":0.02,"rl":[3,6,7,6,3,7,4,5,4,8,9,7,9,8,7],"sid":"0","psid":"0","st":1,"nst":1,"pf":0,"aw":0.00,"wid":0,"wt":"C","wk":"0_C","wbn":null,"wfg":null,"blb":0.00,"blab":0.00,"bl":0.62,"tb":0.00,"tbb":0.00,"tw":0.00,"np":0.00,"ocr":null,"mr":null,"ge":null}},"err":null}',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    `CREATE TABLE IF NOT EXISTS doublefortunejson (
      id INT(10) NOT NULL,
      json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{"dt":{"si":{"wp":null,"lw":null,"slw":null,"nk":null,"sc":0,"fs":null,"gwt":0,"fb":null,"ctw":0.0,"pmt":null,"cwc":0,"fstc":null,"pcwc":0,"rwsp":null,"hashr":null,"ml":1,"cs":0.01,"rl":[8,16,9,11,5,18,1,2,4,12,6,17,7,15,10],"sid":"0","psid":"0","st":1,"nst":1,"pf":0,"aw":0.00,"wid":0,"wt":"C","wk":"0_C","wbn":null,"wfg":null,"blb":0.00,"blab":0.00,"bl":0.31,"tb":0.00,"tbb":0.00,"tw":0.00,"np":0.00,"ocr":null,"mr":null,"ge":null}}}',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    `CREATE TABLE IF NOT EXISTS ganeshagoldjson (
      id INT(10) NOT NULL,
      json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{"dt":{"si":{"wp":null,"lw":null,"ltw":0.0,"snww":null,"fs":null,"sc":0,"gwt":0,"fb":null,"ctw":0.0,"pmt":null,"cwc":0,"fstc":null,"pcwc":0,"rwsp":null,"hashr":null,"ml":2,"cs":0.3,"rl":[2,1,5,4,3,3,0,9,7,8,8,6,7,3,6],"sid":"0","psid":"0","st":1,"nst":1,"pf":0,"aw":0.00,"wid":0,"wt":"C","wk":"0_C","wbn":null,"wfg":null,"blb":0.00,"blab":0.00,"bl":100000.00,"tb":0.00,"tbb":0.00,"tw":0.00,"np":0.00,"ocr":null,"mr":null,"ge":null}},"err":null}',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    `CREATE TABLE IF NOT EXISTS dragontigerluckjson (
      id INT(10) NOT NULL,
      json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{"dt":{"si":{"mrl":{"1":{"wp":null,"lw":null,"tw":0.00,"rl":[1,2,3,2,3,1,2,0,3],"orl":[2,3,0]},"2":{"wp":null,"lw":null,"tw":0.00,"rl":[2,0,1,3,1,2,3,2,1],"orl":[0,1,2]}},"gpt":3,"gwt":0,"fb":null,"ctw":0.0,"pmt":null,"cwc":0,"fstc":null,"pcwc":0,"rwsp":null,"hashr":null,"ml":1,"cs":0.5,"rl":null,"sid":"0","psid":"0","st":1,"nst":1,"pf":0,"aw":0.00,"wid":0,"wt":"C","wk":"0_C","wbn":null,"wfg":null,"blb":0.00,"blab":0.00,"bl":0.26,"tb":0.00,"tbb":0.00,"tw":0.00,"np":0.00,"ocr":null,"mr":null,"ge":null}},"err":null}',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    `CREATE TABLE IF NOT EXISTS bikineparadisejson (
      id INT(11) NOT NULL,
      json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{"dt":{"si":{"wp":null,"lw":null,"orl":null,"wm":0,"rwm":null,"wabm":0.0,"fs":null,"sc":0,"wppr":[[],[],[0,1,2,3],[],[]],"gwt":0,"fb":null,"ctw":0.0,"pmt":null,"cwc":0,"fstc":null,"pcwc":0,"rwsp":null,"hashr":null,"ml":2,"cs":0.3,"rl":[3,8,4,12,9,1,10,5,0,0,0,0,9,1,10,5,3,8,4,12],"sid":"0","psid":"0","st":1,"nst":1,"pf":0,"aw":0.00,"wid":0,"wt":"C","wk":"0_C","wbn":null,"wfg":null,"blb":0.00,"blab":0.00,"bl":100000.00,"tb":0.00,"tbb":0.00,"tw":0.00,"np":0.00,"ocr":null,"mr":null,"ge":null}},"err":null}',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`,

    `CREATE TABLE IF NOT EXISTS butterflyblossomplayerjson (
      id INT(11) NOT NULL,
      json LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{"dt":{"si":{"wp":null,"wp3x5":null,"wpl":null,"ptbr":null,"lw":null,"lwm":null,"rl3x5":[5,6,7,2,0,8,3,1,4,2,0,8,5,6,7],"swl":[[6,3],[8,2],[14,1]],"swlb":[[6,3],[8,2],[14,1]],"nswl":null,"rswl":null,"rs":null,"fs":null,"sc":0,"saw":0.0,"tlw":0.0,"gm":1,"gmi":0,"gml":[1,2,3,5],"gwt":0,"fb":null,"ctw":0.0,"pmt":null,"cwc":0,"fstc":null,"pcwc":0,"rwsp":null,"hashr":null,"ml":2,"cs":0.3,"rl":[1,5,6,7,4,2,0,8,0,3,1,4,4,2,0,8,1,5,6,7],"sid":"0","psid":"0","st":1,"nst":1,"pf":0,"aw":0.00,"wid":0,"wt":"C","wk":"0_C","wbn":null,"wfg":null,"blb":0.00,"blab":0.00,"bl":100000.00,"tb":0.00,"tbb":0.00,"tw":0.00,"np":0.00,"ocr":null,"mr":null,"ge":null}}',
      PRIMARY KEY (id),
      KEY id (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`
  ];

  for (const sql of statements) {
    await promisePool.query(sql);
  }
}

ensureFullSchema()
  .then(() => {
    console.log("OK: Full DB schema ensured");
    process.exit(0);
  })
  .catch((e) => {
    console.error("FAIL:", e);
    process.exit(1);
  });