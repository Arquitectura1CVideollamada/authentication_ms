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
const ftp = require("basic-ftp");
module.exports.ftpupload = function (file, fileftp) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new ftp.Client();
        client.ftp.verbose = true;
        try {
            yield client.access({
                host: "localhost",
                //host: "host.docker.internal",
                user: "myuser",
                password: "mypass",
                secure: false
            });
            yield client.uploadFrom(file, fileftp);
        }
        catch (err) {
            console.log(err);
        }
        client.close();
    });
};
module.exports.ftpdownload = function (file, fileftp) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new ftp.Client();
        client.ftp.verbose = true;
        try {
            yield client.access({
                //host: "localhost",
                host: "host.docker.internal",
                user: "myuser",
                password: "mypass",
                secure: false
            });
            yield client.downloadTo(file, fileftp);
        }
        catch (err) {
            console.log(err);
        }
        client.close();
    });
};
module.exports.ftpremove = function (fileftp) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new ftp.Client();
        client.ftp.verbose = true;
        try {
            yield client.access({
                //host: "localhost",
                host: "host.docker.internal",
                user: "myuser",
                password: "mypass",
                secure: false
            });
            yield client.remove(fileftp);
        }
        catch (err) {
            console.log(err);
        }
        client.close();
    });
};
//# sourceMappingURL=ftp.js.map