"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("./routes/auth"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
//setear el puerto
app.set('port', (process.env.PORT || 3000));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb' }));
app.use((0, cors_1.default)());
//routes
app.use('/auth', auth_1.default);
app.use('/upload', express_1.default.static(path_1.default.resolve('upload')));
exports.default = app;
//# sourceMappingURL=app.js.map