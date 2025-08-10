import { Request, Response } from "express";
import z from "zod";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { error } from "console";

const Client = new PrismaClient();
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  countryCode:z.string()
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export async function signup(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    const { name, email, password, phone,countryCode } = result.data;
    const fullPhone = countryCode + phone;
    const hashedpass = await bcrypt.hash(password, 2);
    const user=await Client.user.findUnique({
        where: {
            email: email
        }
    })
    if(!user){
    await Client.user.create({
      data: {
        name,
        email,
        phone:fullPhone,
        password: hashedpass,
      },
    });
    res.send({
      msg: "Registered Successfully",
    });}
    else{
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
  } catch (e) {
    res.status(500).send({
      msg: "Internal Server Error",
      error:e
    });
  }
}
export async function signin(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    const { email, password } = result.data;

    const user=await Client.user.findUnique({
        where:{
            email
        }
    })
    if(user){
        const passResult=await bcrypt.compare(password,user.password)
        if(passResult){
            const token = jwt.sign(
  {
    id: user.id,            
    email: user.email,       
  },
  process.env.JWT_SECRET!,
  { expiresIn: "24h" }
);
            res.send({
                msg:"user logged in successfully",
                user:user.id,
                token:token
            })
        }
        else{
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
    else{
      res.status(404).send({
        msg:"User not found"
      })
    }
  } catch (e) {
    res.status(500).send({
      msg: "Internal Server Error",
      e:e
    });
  }
}

