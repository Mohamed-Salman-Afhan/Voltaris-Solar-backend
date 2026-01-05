"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var users_1 = require("../application/users");
var usersRouter = express_1.default.Router();
usersRouter.route("/").get(users_1.getAllUsers);
exports.default = usersRouter;
//# sourceMappingURL=users.js.map