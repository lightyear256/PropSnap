import { Response, Request } from "express";
import z from "zod";
import { AuthenticatorRequest } from "../middleware/authMiddleware";
import fs from "fs";
import path from "path";
import { Client } from "../config/db";
import dotenv from 'dotenv';
dotenv.config({
  path: path.resolve(__dirname, '../../.env'), 
});
export const PropertyTypeEnum = z.enum([
  "APARTMENT",
  "HOUSE",
  "PG",
  "COMMERCIAL",
  "VILLA",
  "PLOT",
]);
const ListingTypeEnum = z.enum(["COMMERCIAL", "BUY", "RENT"]);

export interface FileUploadRequest extends Request {
  body: {
    title?: string;
    description?: string;
    category?: string;
  };
}

export interface MultipleFileUploadRequest extends Request {
  body: {
    albumName?: string;
    tags?: string;
  };
}

export const uploadSingleImage = async (
  req: FileUploadRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image uploaded",
      });
    }

    const { title, description } = req.body;

    const fileData = {
      id: Date.now(), 
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      title: title || req.file.originalname,
      description: description || null,
      uploadedAt: new Date(),
    };


    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: fileData,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const uploadMultipleImages = async (
  req: MultipleFileUploadRequest,
  res: Response
) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No images uploaded",
      });
    }

    const { albumName, tags } = req.body;

    const filesData = files.map((file) => ({
      id: Date.now() + Math.random(), 
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
    }));

    const albumData = {
      albumName: albumName || "Untitled Album",
      tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
      files: filesData,
      uploadedAt: new Date(),
    };


    res.status(201).json({
      success: true,
      message: `${files.length} images uploaded successfully`,
      data: albumData,
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};


export const deleteFile = async (req: FileUploadRequest, res: Response) => {
  try {
    const { fileId } = req.params;

    


    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};




const PropertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be a positive number"),
  type: PropertyTypeEnum,
  ListingType: ListingTypeEnum,
  bhk: z.number().int().min(0, "BHK must be positive"),
  sqft: z.number().positive("Square footage must be positive"),
  furnished: z.boolean(),
  available: z.boolean().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});
export const EnquirySchema = z.object({
  message: z.string().min(5, "Message must be at least 5 characters long"),
  propertyId: z.string().uuid("Invalid property ID"),
});
export const EnquiryReplySchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  enquiryId: z.string().uuid("Invalid enquiry ID format"),
});
export async function registerProperty(
  req: AuthenticatorRequest,
  res: Response
) {
  try {

    let propertyData: any;

    if (req.body.propertyData) {
      try {
        propertyData = JSON.parse(req.body.propertyData);
      } catch (parseError) {
        console.error("Error parsing propertyData JSON:", parseError);
        return res.status(400).json({
          error: "Invalid JSON in propertyData field",
        });
      }
    } else {
      propertyData = {
        title: req.body.title,
        description: req.body.description,
        price: parseFloat(req.body.price),
        type: req.body.type,
        ListingType: req.body.ListingType,
        bhk: parseInt(req.body.bhk),
        sqft: parseFloat(req.body.sqft),
        furnished: req.body.furnished === "true",
        available: req.body.available === "true",
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        address: req.body.address,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
      };
    }

    const result = PropertySchema.safeParse(propertyData);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }

    const validatedData = result.data;
    const { city, ...rest } = validatedData;
    const listedById = req.user?.id;

    if (!listedById) {
      return res.status(401).json({
        user: req.user,
        error: "Unauthorized: User ID not found",
      });
    }

    let cityRecord = await Client.city.findFirst({
      where: {
        name: city,
        state: propertyData.state,
        isActive: true,
      },
    });

    if (!cityRecord) {
      cityRecord = await Client.city.create({
        data: {
          name: city,
          state: propertyData.state,
          country: propertyData.country || "India",
        },
      });
    }

    const existing = await Client.property.findFirst({
      where: {
        address: propertyData.address,
        cityId: cityRecord.id,
        listedById: listedById,
      },
    });

    if (existing) {
      return res.status(409).json({ error: "Property already listed by you." });
    }

    const imageData: Array<{ url: string; description: string | " " }> = [];
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      files.forEach((file: any, index: number) => {
        const imageUrl: string = `${process.env.BACKEND_URL}/${file.filename}`;

        let descriptions: string[] = [];

        if (req.body.imageDescriptions) {
          const imageDescs: any = req.body.imageDescriptions;

          if (typeof imageDescs === "string") {
            if (imageDescs.startsWith("[")) {
              try {
                descriptions = JSON.parse(imageDescs) as string[];
              } catch (e: any) {
                console.error("Failed to parse imageDescriptions as JSON:", e);
                descriptions = [];
              }
            } else {
              descriptions = imageDescs
                .split(",")
                .map((desc: string) => desc.trim());
            }
          } else if (Array.isArray(imageDescs)) {
            descriptions = imageDescs as string[];
          }
        }


        imageData.push({
          url: imageUrl,
          description: descriptions[index] || "",
        });
      });
    }
    const newProperty = await Client.property.create({
      data: {
        ...rest,
        listedById,
        cityId: cityRecord.id,
        images:
          imageData.length > 0
            ? {
                create: imageData,
              }
            : undefined,
      },
      include: {
        images: true,
        city: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Property added successfully",
      data: newProperty,
    });
  } catch (error) {
    console.error("Error registering property:", error);

    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
export async function getallProperties(
  req: AuthenticatorRequest,
  res: Response
) {
  try {
    
    const {
      id,
      propertyId,
      city,
      state,
      country,
      type,
      bhk,
      furnished,
      minPrice,
      maxPrice,
      listingType,
    } = req.query;
    const userId = req.user?.id;
    
        const filters: any = {};

    filters.city = {
      name: {
        equals: String(city),
        mode: "insensitive",
      },
    };
    if (state) filters.state = String(state);
    if (country) filters.country = String(country);
    if (type) filters.type = String(type);
    if (bhk) filters.bhk = parseInt(String(bhk));
    if (listingType) filters.listingType = String(listingType);
    if (furnished !== undefined)
      filters.furnished = String(furnished).toLowerCase() === "true";

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(String(minPrice));
      if (maxPrice) filters.price.lte = parseFloat(String(maxPrice));
    }
    let properties;

    if(id){
      properties = await Client.property.findUnique({
        where:{
          id:String(id),
        },
        include: {
          images: true,
          city: true,
        },
      });
    }
    else if (propertyId) {
      if (typeof propertyId !== "string") {
        return res.status(400).json({ msg: "Invalid propertyId" });
      }
      properties = await Client.property.findUnique({
        where: {
          id: propertyId,
        },
        include: {
          images: true,
          city: true,
          enquiries: {
            include: {
              replies: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          favourites: {
            where: {
              userId: userId,
            },
          },
          listedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    } else if (filters.city.name.equals != "undefined") {
      properties = await Client.property.findMany({
        where: filters,
        include: {
          images: true,
          city: true,
          favourites: {
            where: {
              userId: userId,
            },
          },
          listedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      properties = await Client.property.findMany({
        include: {
          images: true,
          city: true,
          favourites: {
            where: {
              userId: userId,
            },
          },
          listedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    res.status(200).send({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).send({
      success: false,
      message: "internal server error",
      error: error,
    });
  }
}

export async function myProperties(req: AuthenticatorRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const properties = await Client.property.findMany({
      where: {
        listedById: userId,
      },
      include: {
        images: true,
        city: true,
        enquiries: {
          include: {
            replies: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        favourites: {
          where: {
            userId: userId,
          },
        },
        listedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    res.status(200).send({
      success: true,
      data: properties,
    });
  } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).send({
      success: false,
      message: "internal server error",
      error: error,
    });
  }
}

export async function deleteProperty(req: AuthenticatorRequest, res: Response) {
  try {
    const { id , listedById} = req.body;
    const userid = req.user?.id;
    if (listedById != userid) {
      return res.status(403).send({
        msg: "dont have permission",
        listedById,
        userid,
      });
    }
    await Client.property.delete({
      where: {
        id: id,
      },
    });
    res.send({
      msg: "property deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      msg: "internal server error",
      error
    });
  }
}
export async function updateProperty(req: AuthenticatorRequest, res: Response) {
  try {
    let propertyData: any;
    let existingImages: any[] = [];

    if (req.body.propertyData) {
      try {
        propertyData = JSON.parse(req.body.propertyData);
      } catch (parseError) {
        console.error("Error parsing propertyData JSON:", parseError);
        return res.status(400).json({
          error: "Invalid JSON in propertyData field",
        });
      }

      if (req.body.existingImages) {
        try {
          existingImages = JSON.parse(req.body.existingImages);
        } catch (parseError) {
          console.error("Error parsing existingImages JSON:", parseError);
          existingImages = [];
        }
      }
    } else {
      propertyData = {
        id: req.body.id,
        creatorId: req.body.creatorId,
        title: req.body.title,
        description: req.body.description,
        price: parseFloat(req.body.price),
        type: req.body.type,
        ListingType: req.body.ListingType,
        bhk: parseInt(req.body.bhk),
        sqft: parseFloat(req.body.sqft),
        furnished: req.body.furnished === "true",
        available: req.body.available === "true",
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        address: req.body.address,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
      };
    }

    const { id, creatorId, city, ...updateData } = propertyData;
    const userId = req.user?.id;

    if (!id) {
      return res.status(400).json({
        error: "Property ID is required for update",
      });
    }

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized: User ID not found",
      });
    }

    const existingProperty = await Client.property.findUnique({
      where: { id: id },
      include: {
        images: true,
        city: true,
      },
    });

    if (!existingProperty) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    if (existingProperty.listedById !== userId) {
      return res.status(403).json({
        error: "You don't have permission to update this property",
      });
    }

    let cityRecord : any = existingProperty.city;
    if (city && city !== existingProperty.city.name) {
      cityRecord = await Client.city.findFirst({
        where: {
          name: city,
          state: updateData.state,
          isActive: true,
        },
      });

      if (!cityRecord) {
        cityRecord = await Client.city.create({
          data: {
            name: city,
            state: updateData.state,
            country: updateData.country || "India",
          },
        });
      }
    }

    const newImageData: Array<{ url: string; description: string | " " }> = [];
    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      files.forEach((file: any, index: number) => {
        const imageUrl: string = `${process.env.BACKEND_URL}/uploads/properties/${file.filename}`;

        let descriptions: string[] = [];

        if (req.body.imageDescriptions) {
          const imageDescs: any = req.body.imageDescriptions;

          if (typeof imageDescs === "string") {
            if (imageDescs.startsWith("[")) {
              try {
                descriptions = JSON.parse(imageDescs) as string[];
              } catch (e: any) {
                console.error("Failed to parse imageDescriptions as JSON:", e);
                descriptions = [];
              }
            } else {
              descriptions = imageDescs
                .split(",")
                .map((desc: string) => desc.trim());
            }
          } else if (Array.isArray(imageDescs)) {
            descriptions = imageDescs as string[];
          }
        }

        newImageData.push({
          url: imageUrl,
          description: descriptions[index] || "",
        });
      });
    }

    const result = await Client.$transaction(async (prisma) => {
      await prisma.property.update({
        where: { id: id },
        data: {
          ...updateData,
          cityId: cityRecord.id,
        },
      });

      if (existingImages.length > 0 || newImageData.length > 0) {
        const currentImages = await prisma.propertyImage.findMany({
          where: { propertyId: id },
        });

        const existingImageIds = existingImages.map((img) => img.id).filter(Boolean);
        const imagesToDelete = currentImages.filter(
          (img) => !existingImageIds.includes(img.id)
        );

        if (imagesToDelete.length > 0) {
          await prisma.propertyImage.deleteMany({
            where: {
              id: {
                in: imagesToDelete.map((img) => img.id),
              },
            },
          });

          imagesToDelete.forEach((img) => {
            const filename = img.url.split('/').pop();
            if (filename) {
              const filePath = path.join('uploads/properties', filename);
              fs.unlink(filePath, (err) => {
                if (err) console.error("Error deleting file:", err);
              });
            }
          });
        }

        for (const existingImg of existingImages) {
          if (existingImg.id) {
            await prisma.propertyImage.update({
              where: { id: existingImg.id },
              data: { description: existingImg.description || "" },
            });
          }
        }

        if (newImageData.length > 0) {
          await prisma.propertyImage.createMany({
            data: newImageData.map((img) => ({
              ...img,
              propertyId: id,
            })),
          });
        }
      }

      return await prisma.property.findUnique({
        where: { id: id },
        include: {
          images: true,
          city: true,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: result,
    });

  } catch (error) {
    console.error("Error updating property:", error);

    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function deleteFavourite(
  req: AuthenticatorRequest,
  res: Response
) {
  try {
    const { propertyId } = req.body;
    const userid = req.user?.id;
    if (!userid) {
      return res.status(401).send({
        msg: "Unauthorized: User ID not found",
      });
    }

    await Client.favourite.delete({
      where: {
        userId_propertyId: {
          userId: userid,
          propertyId: propertyId,
        },
      },
    });
    res.send({
      msg: "deleted sucessfully",
    });
  } catch (error) {
    res.status(500).send({
      msg: "Internal server Error",
      error,
    });
  }
}
export async function addFavourite(req: AuthenticatorRequest, res: Response) {
  try {
    const { propertyId } = req.body;
    const userid = req.user?.id;

    if (!userid) {
      return res.status(401).send({
        msg: "Unauthorized: User ID not found",
      });
    }
    const fav = await Client.favourite.findUnique({
      where: {
        userId_propertyId: {
          userId: userid,
          propertyId: propertyId,
        },
      },
    });
    if (fav) {
      return res.send({
        msg: "already added to favourite",
      });
    }
    await Client.favourite.create({
      data: {
        propertyId: propertyId,
        userId: userid,
      },
    });
    res.send({
      msg: "added to favourite",
    });
  } catch (error) {
    res.status(500).send({
      msg: "Internal server Error",
      error: error,
    });
  }
}
export async function raiseEnquiry(req: AuthenticatorRequest, res: Response) {
  try {
    const result = EnquirySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ user: req.user, error: "Unauthorized: User ID not found" });
    }
    const data = result.data;
    const Comments = await Client.enquiry.create({
      data: {
        ...data,
        userId: userId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    res.send({
      success: true,
      data: Comments,
      msg: "Enquiry raised successfully",
    });
  } catch (error) {
    res.status(500).send({
      msg: "Internal server Error",
      error: error,
    });
  }
}
export async function reply(req: AuthenticatorRequest, res: Response) {
  try {
    const result = EnquiryReplySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ user: req.user, error: "Unauthorized: User ID not found" });
    }

    const { enquiryId, message } = result.data;

    const originalEnquiry = await Client.enquiry.findUnique({
      where: { id: enquiryId },
      include: {
        property: {
          select: { id: true, listedById: true, title: true },
        },
      },
    });

    if (!originalEnquiry) {
      return res.status(404).json({
        error: "Enquiry not found",
      });
    }

    if (originalEnquiry.property.listedById !== userId) {
      return res.status(403).json({
        error:
          "Forbidden: Only property owner can reply to enquiries about their properties",
      });
    }

    const reply = await Client.enquiryReply.create({
      data: {
        message: message,
        userId: userId,
        enquiryId: enquiryId,
      },
      include: {
        user: { select: { id: true, name: true } },
        enquiry: {
          include: {
            property: { select: { title: true } },
          },
        },
      },
    });

    res.send({
      success: true,
      data: reply,
      msg: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).send({
      success: false,
      msg: "Internal server Error",
      error: error,
    });
  }
}
export async function getAllenquires(req: Request, res: Response) {
  try {
    const { propertyId } = req.query;

    if (!propertyId) {
      return res.status(400).json({
        error: "Property ID is required",
      });
    }

    const property = await Client.property.findUnique({
      where: { id: propertyId as string },
    });

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    const threadedEnquiries = await Client.enquiry.findMany({
      where: {
        propertyId: propertyId as string,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalReplies = threadedEnquiries.reduce(
      (sum, enquiry) => sum + enquiry.replies.length,
      0
    );

    res.json({
      success: true,
      enquiries: threadedEnquiries,
      propertyId,
      totals: {
        mainEnquiries: threadedEnquiries.length,
        replies: totalReplies,
        total: threadedEnquiries.length + totalReplies,
      },
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    res.status(500).send({
      msg: "Internal server Error",
      error: error,
    });
  }
}
export async function getAllCities(req: Request, res: Response) {
  try {
    const propertyType =
      typeof req.query.propertyType === "string" ? req.query.propertyType : "";
    const bhk = typeof req.query.bhk === "string" ? req.query.bhk : "";
    const listingType =
      typeof req.query.listingType === "string" ? req.query.listingType : "";


    const propertyFilters: any = {
      available: true,
    };

    if (propertyType && propertyType !== "") {
      propertyFilters.type = propertyType;
    }

    if (bhk && bhk !== "") {
      const bhkNumber = parseInt(bhk.split(" ")[0]);  
      if (!isNaN(bhkNumber)) {
        if (bhk.includes("5+")) {
          propertyFilters.bhk = { gte: 5 };
        } else {
          propertyFilters.bhk = bhkNumber;
        }
      }
    }

    if (listingType && listingType !== "") {
      propertyFilters.ListingType = listingType.toUpperCase();
    }


    const matchingProperties = await Client.property.findMany({
      where: propertyFilters,
      select: {
        id: true,
        title: true,
        type: true,
        bhk: true,
        ListingType: true,
        cityId: true,
        city: {
          select: {
            name: true,
            state: true,
          },
        },
      },
    });


    const whereClause =
      Object.keys(propertyFilters).length === 1 && propertyFilters.available
        ? {
            isActive: true,
            properties: {
              some: {
                available: true, 
              },
            },
          }
        : {
            isActive: true,
            properties: {
              some: propertyFilters, 
            },
          };

    

    const cities = await Client.city.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        state: true,
        _count: {
          select: {
            properties: {
              where: propertyFilters, 
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });


    const transformedCities = cities.map((city) => ({
      id: city.id,
      name: city.name,
      state: city.state,
      propertyCount: city._count.properties,
    }));

    res.status(200).json({
      success: true,
      data: transformedCities,
      filters: { propertyType, bhk, listingType },
      debug: {
        appliedFilters: propertyFilters,
        totalCitiesFound: cities.length,
        sampleMatchingProperties: matchingProperties.slice(0, 3),
      },
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
      error: error,
    });
  }
}

export async function getAllFavourites(
  req: AuthenticatorRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized: user not found" });
    }

    const favourites = await Client.favourite.findMany({
      where: {
        userId: userId,
      },
      include: {
        property: {
          include: {
            city: true, 
            images: true, 
            favourites: true,
          },
        },
      },
    });
    const favprop = favourites.map((fav) => fav.property);

    return res.status(200).send({
      success: true,
      data: favprop,
    });
  } catch (error) {
    console.error("Error fetching favourites:", error);
    return res.status(500).json({
      msg: "Internal Server Error",
      error,
    });
  }
}
