"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = void 0;
var loggerMiddleware = function (req, res, next) {
    console.log("".concat(req.method, " ").concat(req.url));
    next();
};
exports.loggerMiddleware = loggerMiddleware;
//# sourceMappingURL=logger-middleware.js.map