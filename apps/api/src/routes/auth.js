"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middlewares/auth");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
router.post('/register', auth_1.registerUser);
router.post('/login', auth_1.loginUser);
router.post('/google', auth_1.googleLogin);
router.get('/me', auth_2.protect, auth_1.getMe);
router.put('/password', auth_2.protect, auth_1.updatePassword);
router.post('/forgot-password', auth_1.forgotPassword);
router.put('/reset-password/:token', auth_1.resetPassword);
router.put('/profile', auth_2.protect, upload.single('avatar'), auth_1.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map