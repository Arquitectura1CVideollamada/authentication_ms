"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const authcontroller_1 = require("../controllers/authcontroller");
const authcontroller_2 = require("../controllers/authcontroller");
const authcontroller_3 = require("../controllers/authcontroller");
router.post('/singup', authcontroller_2.singup);
router.post('/singin', authcontroller_1.singin);
const validateToken_1 = require("../libs/validateToken");
router.get('/profile', validateToken_1.tokenval, authcontroller_3.profile);
exports.default = router;
//# sourceMappingURL=auth.js.map