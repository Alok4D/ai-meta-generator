"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = require("../controllers/admin");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.use(auth_1.admin);
router.get('/overview', admin_1.getOverviewStats);
router.get('/users', admin_1.getAllUsers);
router.put('/users/:id', admin_1.updateUser);
router.get('/support', admin_1.getAllSupportMessages);
router.patch('/support/:id/status', admin_1.updateSupportMessageStatus);
exports.default = router;
//# sourceMappingURL=admin.js.map