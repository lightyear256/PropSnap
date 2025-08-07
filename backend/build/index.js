"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const userRouter_1 = require("./routes/userRouter");
const propertiesRouter_1 = require("./routes/propertiesRouter");
const chatRouter_1 = require("./routes/chatRouter");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)({
    origin: "*",
    credentials: true
}));
exports.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
exports.app.use('/user', userRouter_1.userRouter);
exports.app.use('/property', propertiesRouter_1.propertyRouter);
exports.app.use('/chat', chatRouter_1.chatRouter);
