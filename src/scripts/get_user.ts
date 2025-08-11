import promisePool from "../database";

async function run() {
  try {
    const username = process.argv[2];
    if (!username) {
      console.error("Usage: node dist/scripts/get_user.js <username>");
      process.exit(1);
    }
    const [rows]: any = await promisePool.query("SELECT * FROM users WHERE username = ? ORDER BY id DESC LIMIT 1", [username]);
    console.log(JSON.stringify(rows && rows[0] ? rows[0] : null));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  process.exit(0);
}
run();