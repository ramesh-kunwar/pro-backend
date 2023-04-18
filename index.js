const app = require("./app")
require("dotenv").config()

const connectWithDB = require("./config/db")


connectWithDB()

app.listen(process.env.PORT, () => console.log(`App is running at PORT ${process.env.PORT}`))