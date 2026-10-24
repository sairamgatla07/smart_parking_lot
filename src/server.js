
require("dotenv").config();

const dns = require("node:dns");

if (process.env.CUSTOM_DNS_SERVERS) {
  dns.setServers(process.env.CUSTOM_DNS_SERVERS.split(","));
}
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Smart Parking API running on port ${PORT}`)))
  .catch((error) => {
    console.error("Failed to start application:", error.message);
    process.exit(1);
  });
