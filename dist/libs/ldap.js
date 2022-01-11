"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../domain/model");
const ldapjs_1 = __importDefault(require("ldapjs"));
const assert_1 = __importDefault(require("assert"));
class LDAPAuthService {
    constructor(ldapConfig) {
        this.config = ldapConfig;
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const ldapConfig = this.config;
                const client = ldapjs_1.default.createClient({
                    url: ldapConfig.hostname,
                    reconnect: true,
                });
                client.bind(ldapConfig.username, ldapConfig.password, err => {
                    assert_1.default.ifError(err);
                    const opts = {
                        filter: '(&(objectClass=user)(mail=' + email + '))',
                        scope: 'sub',
                        paged: true,
                        sizeLimit: 200,
                    };
                    let object = null;
                    client.search(ldapConfig.search, opts, (err, res) => {
                        if (err) {
                            return reject(err);
                        }
                        res.on('searchEntry', entry => {
                            object = entry.object;
                        });
                        res.on('error', err => {
                            console.error('error: ' + err.message);
                            client.destroy();
                            reject(err);
                        });
                        res.on('end', result => {
                            if (!object) {
                                client.destroy();
                                return reject('Invalid user on ldap');
                            }
                            client.bind(object.dn, password, err => {
                                if (err) {
                                    client.destroy();
                                    console.error('Invalid Login', err);
                                    return reject(err);
                                }
                                client.destroy();
                                return resolve(new model_1.User(object.dn, object.sAMAccountName, object.mail));
                            });
                        });
                    });
                });
            });
        });
    }
}
exports.default = LDAPAuthService;
//# sourceMappingURL=ldap.js.map