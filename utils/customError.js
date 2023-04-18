class CustomError extends Error {
    constructor(message, code) {
        super(message) // message is displayed from built in Error class
        this.code = code;
    }
}

module.exports = CustomError;