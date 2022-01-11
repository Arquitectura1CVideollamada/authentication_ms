"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_1 = __importDefault(require("./user"));
const usertokenSchema = new mongoose_1.Schema({
    token: {
        type: String,
    },
    user: user_1.default.schema
}, {
//timestamps: true
});
exports.default = (0, mongoose_1.model)('Authtoken', usertokenSchema);
//# sourceMappingURL=usertoken.js.map