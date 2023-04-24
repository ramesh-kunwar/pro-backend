const BigPromise = require("../middleware/BigPromise")
const User = require("../models/user");

const fileUpload = require("express-fileupload")
const cloudinary = require("cloudinary").v2
const crypto = require("crypto")

const cookieToken = require("../utils/cookieToken");
const CustomError = require("../utils/customError")
const mailHelper = require("../utils/emailHelper")


exports.signup = BigPromise(async (req, res, next) => {
    // if file  / photo not found
    if (!req.files) {
        return next(new CustomError("Phoso is required for signup", 400))
    }

    const { name, email, password } = req.body;

    // if file found
    let result;

    let file = req.files.photo;



    result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "users",
        width: 150,
        crop: "scale"
    })




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


exports.login = BigPromise(async (req, res, next) => {

    const { email, password } = req.body;

    // check for presense of email and password

    if (!email || !password) {
        return next(new CustomError("Please provide email and password", 400))
    }


    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        return next(new CustomError("Email or password doesn't match", 400))
    }

    const isPasswordCorrect = await user.isValidatedPassword(password);

    if (!isPasswordCorrect) {
        return next(new CustomError("Email or password doesn't match", 400))
    }


    cookieToken(user, res)
})

exports.logout = BigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: "Logout success"
    })
})

exports.forgotPassword = BigPromise(async (req, res, next) => {

    const { email } = req.body;
    const user = await User.findOne({ email })

    if (!user) {
        return next(new CustomError('Email not found as registered', 404));
    }

    const forgotToken = user.getForgotPasswordToken()

    await user.save({ validateBeforeSave: false })

    const myUrl = `${req.protocol}://${req.get("host")}/password/reset/${forgotToken}`

    const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;


    try {
        await mailHelper({
            email: user.email,
            subject: "Password reset email",
            message

        })
        res.status(200).json({
            success: true,
            message: "Email sent successfully"
        })
    } catch (error) {

        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({ validateBeforeSave: false })

        return next(new CustomError(error.message, 500))
    }

})

exports.passwordReset = BigPromise(async (req, res, next) => {

    const token = req.params.token;

    const encryToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
        encryToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return next(new CustomError('Token is invalid or expired', 400))
    }

    if (req.body.password != req.body.confirmPassword) {
        return next(new CustomError('Password and Confir Password do not match', 400))

    }

    user.password = req.body.password

    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    await user.save()

    // send a json response OR token

})


exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {

    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })

})

exports.changePassword = BigPromise(async (req, res, next) => {

    const userId = req.user.id

    const user = await User.findById(userId).select("+password")

    const isCorrectOldPassword = await user.isValidatedPassword(req.body.oldPassword)

    if (!isCorrectOldPassword) {
        return next(new CustomError("Old password is incorrect", 400))
    }

    user.password = req.body.password

    await user.save()

    cookieToken(user, res)

})
