const app = require("./app")
require("dotenv").config()


app.listen(process.env.PORT, () => console.log(`App is running at PORT ${process.env.PORT}`))