import { Router } from "express";
import { signin,signup } from "../controller/userController";
export const userRouter=Router()

userRouter.post('/auth/register',signup)
userRouter.post('/auth/login',signin)
