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
exports.messageSchema = void 0;
exports.Messenger = Messenger;
exports.create = create;
exports.getAllChats = getAllChats;
exports.getAllMessages = getAllMessages;
const zod_1 = __importDefault(require("zod"));
const db_1 = require("../config/db");
exports.messageSchema = zod_1.default.object({
    id: zod_1.default.string().uuid(),
    content: zod_1.default.string().min(1, "Content cannot be empty"),
    messageType: zod_1.default
        .enum(["TEXT"])
        .default("TEXT"),
    attachmentUrl: zod_1.default.string().url("Invalid attachment URL").optional(),
    attachmentType: zod_1.default.string().optional(),
});
function Messenger(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const result = exports.messageSchema.safeParse(req.body);
            const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!result.success) {
                return res.status(400).json({ error: result.error.format() });
            }
            if (!senderId) {
                return res.status(401).send({
                    msg: "Unauthorized: User ID not found hehehe",
                });
            }
            const data = result.data;
            let convo = yield db_1.Client.conversation.findFirst({
                where: {
                    id: data.id
                },
            });
            if (!(convo === null || convo === void 0 ? void 0 : convo.id) || !(convo === null || convo === void 0 ? void 0 : convo.buyerId) || !(convo === null || convo === void 0 ? void 0 : convo.sellerId)) {
                throw new Error("Missing conversation or user IDs");
            }
            const message = yield db_1.Client.message.create({
                data: {
                    content: data.content,
                    messageType: (_b = data === null || data === void 0 ? void 0 : data.messageType) !== null && _b !== void 0 ? _b : "TEXT",
                    senderId: senderId,
                    receiverId: senderId === (convo === null || convo === void 0 ? void 0 : convo.buyerId) ? convo === null || convo === void 0 ? void 0 : convo.sellerId : convo === null || convo === void 0 ? void 0 : convo.buyerId,
                    conversationId: convo === null || convo === void 0 ? void 0 : convo.id,
                },
            });
            res.send({
                success: true,
                msg: "send successfully",
                data: message
            });
        }
        catch (error) {
            res.status(500).send({
                msg: "Internal Server Error",
                error,
                success: false
            });
        }
    });
}
function create(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const sellerId = (_a = req.body.sellerId) === null || _a === void 0 ? void 0 : _a.toString();
            const buyerId = (_b = req.body.buyerId) === null || _b === void 0 ? void 0 : _b.toString();
            const propertyId = (_c = req.body.propertyId) === null || _c === void 0 ? void 0 : _c.toString();
            if (!sellerId || !buyerId || !propertyId) {
                return res.status(400).json({ success: false, msg: "Missing required query parameters" });
            }
            const conversation1 = yield db_1.Client.conversation.findFirst({
                where: {
                    sellerId: sellerId,
                    propertyId: propertyId,
                    buyerId: buyerId,
                }
            });
            if (conversation1) {
                return res.send({
                    success: true,
                    id: conversation1.id,
                });
            }
            const conversation = yield db_1.Client.conversation.create({
                data: {
                    sellerId: sellerId,
                    propertyId: propertyId,
                    buyerId: buyerId,
                },
            });
            res.send({
                success: true,
                id: conversation.id,
            });
        }
        catch (error) {
            res.status(500).send({
                msg: "internal server error",
                error: error,
                success: false,
            });
        }
    });
}
function getAllChats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { propertyId } = req.query;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const chats = yield db_1.Client.conversation.findMany({
                where: {
                    propertyId: propertyId === null || propertyId === void 0 ? void 0 : propertyId.toString(),
                    sellerId: userId
                },
                include: {
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    property: {
                        select: {
                            id: true,
                            title: true,
                            bhk: true,
                            type: true,
                            city: {
                                select: {
                                    state: true,
                                    name: true
                                }
                            },
                            price: true,
                            ListingType: true
                        }
                    }
                }
            });
            res.send({
                chats: chats,
                success: true
            });
        }
        catch (error) {
            res.status(500).send({
                msg: "Internal server Error",
                success: false,
                error: error
            });
        }
    });
}
function getAllMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.query;
            const messages = yield db_1.Client.message.findMany({
                where: {
                    conversationId: id,
                },
                include: {
                    sender: true,
                    receiver: true
                },
                orderBy: {
                    createdAt: "asc",
                },
                take: 50,
            });
            res.status(200).json({
                success: true,
                data: {
                    messages,
                    totalCount: messages.length,
                },
            });
        }
        catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch messages",
            });
        }
    });
}
