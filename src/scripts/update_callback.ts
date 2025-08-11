import promisePool from "../database";

async function run() {
  try {
    await promisePool.query("UPDATE agents SET callbackurl = ? WHERE agentToken = ? AND secretKey = ?", [
      "http://localhost:3000/",
      "test",
      "test",
    ]);
    console.log("OK: callbackurl atualizado para http://localhost:3000/");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();