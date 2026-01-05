"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationMiddleware = void 0;
var express_1 = require("@clerk/express");
var errors_1 = require("../../domain/errors/errors");
var authenticationMiddleware = function (req, res, next) {
    var auth = (0, express_1.getAuth)(req);
    if (!auth.userId) {
        throw new errors_1.UnauthorizedError("Unauthorized");
    }
    next();
};
exports.authenticationMiddleware = authenticationMiddleware;
//# sourceMappingURL=authentication-middleware.js.map