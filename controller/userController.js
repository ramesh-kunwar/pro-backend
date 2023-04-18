const BigPromise = require("../middleware/BigPromise")
const User = require("../models/user");
const cookieToken = require("../utils/cookieToken");
const CustomError = require("../utils/customError")


exports.signup = BigPromise(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!email || !name || !password) {
        return next(new CustomError("Name, Email and Password are required", 400))
    }

    const user = await User.create({
        name,
        email,
        password
    })

    cookieToken(user, res)


   
})