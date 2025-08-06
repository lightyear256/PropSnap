import { Router } from "express";
import { create, getAllChats, getAllMessages, Messenger } from "../controller/chatController";
import { authMiddleware } from "../middleware/authMiddleware";

export const chatRouter=Router();
chatRouter.use(authMiddleware)
chatRouter.post("/create",create)
chatRouter.get('/chats',getAllChats)
chatRouter.post('/send',Messenger)
chatRouter.get('/fetch',getAllMessages)