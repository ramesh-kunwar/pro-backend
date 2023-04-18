const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please provide a name"],
        maxlength: [40, "Name should be under 40 characters"]
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        validate: [validator.isEmail, "Please enter email in correct format"],
        unique: [true, "Email must be unique"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password should be at least characters"],
        select: false, // whenever you are going to select user model -> pw field doesn't come
    },
    role: {
        role: String,
        default: "user"
    },
    photo: {
        id: {
            type: String,
            required: true,
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    }


})


// encrypt the password before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// validate the password with passed on user password
userSchema.methods.isValidatedPassword = async (userPassword) => {
    return await bcrypt.compare(userPassword, this.password);
}

// create and return jwt token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY })
}

// generate forgot password token
userSchema.methods.getForgotPasswordToken = function () {
    // generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString('hex');

    // getting a hash -  make sure to get a hash on backend
    // while sending to the user, send in plain text
    this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex")

    // time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

    return forgotToken;

}


module.exports = mongoose.model("User", userSchema)