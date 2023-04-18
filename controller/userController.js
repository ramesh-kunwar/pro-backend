const BigPromise = require("../middleware/BigPromise")
const User = require("../models/user");

const fileUpload = require("express-fileupload")
const cloudinary = require("cloudinary").v2

const cookieToken = require("../utils/cookieToken");
const CustomError = require("../utils/customError")


exports.signup = BigPromise(async (req, res, next) => {
    // if file  / photo not found
    if (!req.files) {
        return next(new CustomError("Phoso is required for signup", 400))
    }

    // if file found
    let file = req.files.photo;
    console.log(file.tempFilePath);
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "users",
        width: 150,
        crop: "scale"
    })

    const { name, email, password } = req.body;

    if (!email || !name || !password) {
        return next(new CustomError("Name, Email and Password are required", 400))
    }

    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    })

    user.password = undefined;
    cookieToken(user, res)



})