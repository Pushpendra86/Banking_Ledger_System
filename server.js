require("dotenv").config({ path: "./src/.env" });
const app = require("./src/app");
const connectToDB = require("./src/config/db");

connectToDB();

//routes

app.listen(3000, () => console.log("server started at PORT, 3000"));
