import  express from "express";
import { userRouter } from "./routes/userRouter";
import { propertyRouter } from "./routes/propertiesRouter";
import { chatRouter } from "./routes/chatRouter";
import cors from 'cors';
import path from "path";
export const app=express();
app.use(express.json());
app.use(cors({
  origin: "*", 
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname,'..', 'uploads')));
app.use('/user',userRouter);
app.use('/property',propertyRouter)
app.use('/chat',chatRouter)
app.get('/ping', (req, res) => {
  res.send('pong');
});


