require("dotenv").config()
const express = require("express")
const app = express()

const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")

// middleware
app.use(morgan("tiny"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// cookies and file upload
app.use(cookieParser())
app.use(fileUpload())



// import all routes
const home = require("./routes/home")

// router middleware
app.use("/api/v1", home)


module.exports = app;