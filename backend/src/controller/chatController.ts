import { Response } from "express";
import { AuthenticatorRequest } from "../middleware/authMiddleware";
import z from "zod";
import { Client } from "../config/db";

export const messageSchema = z.object({
  id:z.string().uuid(),
  content: z.string().min(1, "Content cannot be empty"),
  messageType: z
    .enum(["TEXT"])
    .default("TEXT"),
 

  attachmentUrl: z.string().url("Invalid attachment URL").optional(),
  attachmentType: z.string().optional(),
});
export async function Messenger(req: AuthenticatorRequest, res: Response) {
  try {
    const result = messageSchema.safeParse(req.body);
    const senderId = req.user?.id;

    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    
    if (!senderId) {
      return res.status(401).send({
        msg: "Unauthorized: User ID not found hehehe",
      });
    }
    const data = result.data;
    let convo = await Client.conversation.findFirst({
      where: {
        id:data.id
      },
    });
    

    if (!convo?.id || !convo?.buyerId || !convo?.sellerId) {
  throw new Error("Missing conversation or user IDs");
}



    const message=await Client.message.create({
      data: {
        content: data.content,
        messageType: data?.messageType?? "TEXT",
        senderId: senderId,
        receiverId: senderId === convo?.buyerId ? convo?.sellerId : convo?.buyerId,
        conversationId: convo?.id,
      },
    });
    res.send({
      success:true,
      msg: "send successfully",
      data:message
    });
  } catch (error) {
    res.status(500).send({
      msg: "Internal Server Error",
      error,
      success:false
    });
  }
}
export async function create(req: AuthenticatorRequest, res: Response) {
  try {
    const sellerId = req.body.sellerId?.toString();
    const buyerId = req.body.buyerId?.toString();
    const propertyId = req.body.propertyId?.toString();
    if (!sellerId || !buyerId || !propertyId) {
      return res.status(400).json({ success: false, msg: "Missing required query parameters" });
    }
    const conversation1 =await Client.conversation.findFirst({
      where:{
        sellerId: sellerId,
        propertyId: propertyId,
        buyerId: buyerId,
      }
    })
    if(conversation1){
      return res.send({
      success: true,
      id: conversation1.id,
    });
    }
    const conversation = await Client.conversation.create({
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
  } catch (error) {
    res.status(500).send({
      msg: "internal server error",
      error: error,
      success: false,
    });
  }
}
export async function getAllChats(req: AuthenticatorRequest, res: Response){
  try {
    const {propertyId}=req.query;
    const userId=req.user?.id
    
  const chats=await Client.conversation.findMany({
    where:{
      propertyId:propertyId?.toString(),
      sellerId:userId
    },
    include:{
      buyer:{
        select:{
          id:true,
          name:true,
          email:true
        }
      },
      property:{
        select:{
          id:true,
          title:true,
          bhk:true,
          type:true,
          city:{
            select:{
              state:true,
              name:true
            }
          },
          price:true,
          ListingType:true
        }
      }
    }
  })
  
  res.send({
    chats:chats,
    success:true
  })
  } catch (error) {
    res.status(500).send({
      msg:"Internal server Error",
      success:false,
      error:error
    })
  }
  
}
export async function getAllMessages(req: AuthenticatorRequest, res: Response) {
  try {
    const { id } = req.query;

   
    const messages = await Client.message.findMany({
      where: {
        conversationId: id as string,
      
      },
      include:{
        sender:true,
        receiver:true
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
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
}
