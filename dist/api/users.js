"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var user_controller_1 = require("./controllers/user.controller");
var usersRouter = express_1.default.Router();
usersRouter.route("/").get(user_controller_1.getAllUsers);
exports.default = usersRouter;
//# sourceMappingURL=users.js.map