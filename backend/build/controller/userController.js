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
exports.signup = signup;
exports.signin = signin;
const zod_1 = __importDefault(require("zod"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Client = new client_1.PrismaClient();
const registerSchema = zod_1.default.object({
    name: zod_1.default.string().min(1, "Name is required"),
    email: zod_1.default.string().email("Invalid email"),
    password: zod_1.default.string().min(6, "Password must be at least 6 characters"),
    phone: zod_1.default
        .string()
        .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
    countryCode: zod_1.default.string()
});
const loginSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string(),
});
function signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = registerSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.format() });
            }
            const { name, email, password, phone, countryCode } = result.data;
            const fullPhone = countryCode + phone;
            const hashedpass = yield bcrypt_1.default.hash(password, 2);
            const user = yield Client.user.findUnique({
                where: {
                    email: email
                }
            });
            if (!user) {
                yield Client.user.create({
                    data: {
                        name,
                        email,
                        phone: fullPhone,
                        password: hashedpass,
                    },
                });
                res.send({
                    msg: "Registered Successfully",
                });
            }
            else {
                res.status(400).send({
                    error: {
                        general: {
                            _errors: [
                                "user already exist"
                            ]
                        }
                    }
                });
            }
        }
        catch (e) {
            res.status(500).send({
                msg: "Internal Server Error",
            });
        }
    });
}
function signin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = loginSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.format() });
            }
            const { email, password } = result.data;
            const user = yield Client.user.findUnique({
                where: {
                    email
                }
            });
            if (user) {
                const passResult = yield bcrypt_1.default.compare(password, user.password);
                if (passResult) {
                    const token = jsonwebtoken_1.default.sign({
                        id: user.id,
                        email: user.email,
                    }, process.env.JWT_SECRET, { expiresIn: "24h" });
                    res.send({
                        msg: "user logged in successfully",
                        user: user.id,
                        token: token
                    });
                }
                else {
                    res.status(400).send({
                        error: {
                            general: {
                                _errors: [
                                    "Incorrect Password"
                                ]
                            }
                        }
                    });
                }
            }
            else {
                res.status(404).send({
                    msg: "User not found"
                });
            }
        }
        catch (e) {
            res.status(500).send({
                msg: "Internal Server Error",
            });
        }
    });
}
