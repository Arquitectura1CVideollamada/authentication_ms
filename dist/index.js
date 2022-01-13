"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
dotenv_1.default.config({ path: '../env' });
const app_1 = __importDefault(require("./app"));
require("./database");
function main() {
    var host = process.env.HOST || '0.0.0.0';
    app_1.default.listen(app_1.default.get('port'), () => {
        console.log('servidor funcionando');
    });
    console.log(app_1.default.get('port'));
}
main();
//# sourceMappingURL=index.js.map