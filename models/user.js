const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        maxlength: [40, "Name shoudl be under 40 characters "],
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        validate: [validator.isEmail, 'Please enter email in correct format'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "password should be atleast 6 character"],
        select: false, // when saving to db pw doesn't come.
    },
    role: {
        type: String,
        default: 'user'
    },
    photo: {
        id: {// from cloudnary
            type: String,
            // required: true,
        },
        secure_url: { // from cloudnary
            type: String,
            // required: true,
        },
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordExpiry: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})

// encrypt password before save - HOOKS
userSchema.pre("save", async function (next) { // pre hook

    // don't hash the password if it has not been modified (or is not new)
    if (!this.isModified("password")) {
        return next()
    }

    this.password = await bcrypt.hash(this.password, 10);
    next()

})


// validate the password with passed on user password
userSchema.methods.isValidatedPassword = async function (usersendPassword) {

    return await bcrypt.compare(usersendPassword, this.password)

}

// create and return jwt token
userSchema.methods.getJwtToken = function () {
   return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY })
}

// generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function () {
    // generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString("hex")

    // here we are just encrypting the forgot token
    this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex")

    // time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000

    return forgotToken
}


module.exports = mongoose.model("User", userSchema)