"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
var globalErrorHandler = function (err, req, res, next) {
    console.error(err);
    if (err.name === "NotFoundError") {
        return res.status(404).json({ message: err.message });
    }
    if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
    }
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ message: err.message });
    }
    // Handle other errors
    res.status(500).json({ message: "Internal server error" });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=global-error-handling-middleware.js.map