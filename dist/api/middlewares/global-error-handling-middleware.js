"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
var custom_errors_1 = require("../../domain/errors/custom-errors");
var globalErrorHandler = function (err, req, res, next) {
    if (err instanceof custom_errors_1.AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    // Handle Mongoose Validation Errors
    if (err.name === "ValidationError") {
        return res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
    // Handle Mongoose Duplicate Key Errors
    if (err.code === 11000) {
        var field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            status: "fail",
            message: "Duplicate field value: ".concat(field, ". Please use another value!"),
        });
    }
    console.error("ERROR 💥", err);
    return res.status(500).json({
        status: "error",
        message: "Internal server error",
    });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=global-error-handling-middleware.js.map