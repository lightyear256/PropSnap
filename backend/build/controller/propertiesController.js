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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquiryReplySchema = exports.EnquirySchema = exports.deleteFile = exports.uploadMultipleImages = exports.uploadSingleImage = exports.PropertyTypeEnum = void 0;
exports.registerProperty = registerProperty;
exports.getallProperties = getallProperties;
exports.myProperties = myProperties;
exports.deleteProperty = deleteProperty;
exports.updateProperty = updateProperty;
exports.deleteFavourite = deleteFavourite;
exports.addFavourite = addFavourite;
exports.raiseEnquiry = raiseEnquiry;
exports.reply = reply;
exports.getAllenquires = getAllenquires;
exports.getAllCities = getAllCities;
exports.getAllFavourites = getAllFavourites;
const zod_1 = __importDefault(require("zod"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../config/db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../../.env'),
});
exports.PropertyTypeEnum = zod_1.default.enum([
    "APARTMENT",
    "HOUSE",
    "PG",
    "COMMERCIAL",
    "VILLA",
    "PLOT",
]);
const ListingTypeEnum = zod_1.default.enum(["COMMERCIAL", "BUY", "RENT"]);
const uploadSingleImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});
exports.uploadSingleImage = uploadSingleImage;
const uploadMultipleImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
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
            tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
            files: filesData,
            uploadedAt: new Date(),
        };
        res.status(201).json({
            success: true,
            message: `${files.length} images uploaded successfully`,
            data: albumData,
        });
    }
    catch (error) {
        console.error("Multiple upload error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});
exports.uploadMultipleImages = uploadMultipleImages;
const deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileId } = req.params;
        res.json({
            success: true,
            message: "File deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete file error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});
exports.deleteFile = deleteFile;
const PropertySchema = zod_1.default.object({
    title: zod_1.default.string().min(3, "Title must be at least 3 characters"),
    description: zod_1.default.string().min(10, "Description must be at least 10 characters"),
    price: zod_1.default.number().positive("Price must be a positive number"),
    type: exports.PropertyTypeEnum,
    ListingType: ListingTypeEnum,
    bhk: zod_1.default.number().int().min(0, "BHK must be positive"),
    sqft: zod_1.default.number().positive("Square footage must be positive"),
    furnished: zod_1.default.boolean(),
    available: zod_1.default.boolean().optional(),
    city: zod_1.default.string(),
    state: zod_1.default.string(),
    country: zod_1.default.string(),
    address: zod_1.default.string(),
    latitude: zod_1.default.number(),
    longitude: zod_1.default.number(),
});
exports.EnquirySchema = zod_1.default.object({
    message: zod_1.default.string().min(5, "Message must be at least 5 characters long"),
    propertyId: zod_1.default.string().uuid("Invalid property ID"),
});
exports.EnquiryReplySchema = zod_1.default.object({
    message: zod_1.default.string().min(1, "Message cannot be empty"),
    enquiryId: zod_1.default.string().uuid("Invalid enquiry ID format"),
});
function registerProperty(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            let propertyData;
            if (req.body.propertyData) {
                try {
                    propertyData = JSON.parse(req.body.propertyData);
                }
                catch (parseError) {
                    console.error("Error parsing propertyData JSON:", parseError);
                    return res.status(400).json({
                        error: "Invalid JSON in propertyData field",
                    });
                }
            }
            else {
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
            const { city } = validatedData, rest = __rest(validatedData, ["city"]);
            const listedById = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!listedById) {
                return res.status(401).json({
                    user: req.user,
                    error: "Unauthorized: User ID not found",
                });
            }
            let cityRecord = yield db_1.Client.city.findFirst({
                where: {
                    name: city,
                    state: propertyData.state,
                    isActive: true,
                },
            });
            if (!cityRecord) {
                cityRecord = yield db_1.Client.city.create({
                    data: {
                        name: city,
                        state: propertyData.state,
                        country: propertyData.country || "India",
                    },
                });
            }
            const existing = yield db_1.Client.property.findFirst({
                where: {
                    address: propertyData.address,
                    cityId: cityRecord.id,
                    listedById: listedById,
                },
            });
            if (existing) {
                return res.status(409).json({ error: "Property already listed by you." });
            }
            const imageData = [];
            const files = req.files;
            if (files && files.length > 0) {
                files.forEach((file, index) => {
                    const imageUrl = `${process.env.BACKEND_URL}/${file.filename}`;
                    let descriptions = [];
                    if (req.body.imageDescriptions) {
                        const imageDescs = req.body.imageDescriptions;
                        if (typeof imageDescs === "string") {
                            if (imageDescs.startsWith("[")) {
                                try {
                                    descriptions = JSON.parse(imageDescs);
                                }
                                catch (e) {
                                    console.error("Failed to parse imageDescriptions as JSON:", e);
                                    descriptions = [];
                                }
                            }
                            else {
                                descriptions = imageDescs
                                    .split(",")
                                    .map((desc) => desc.trim());
                            }
                        }
                        else if (Array.isArray(imageDescs)) {
                            descriptions = imageDescs;
                        }
                    }
                    imageData.push({
                        url: imageUrl,
                        description: descriptions[index] || "",
                    });
                });
            }
            const newProperty = yield db_1.Client.property.create({
                data: Object.assign(Object.assign({}, rest), { listedById, cityId: cityRecord.id, images: imageData.length > 0
                        ? {
                            create: imageData,
                        }
                        : undefined }),
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
        }
        catch (error) {
            console.error("Error registering property:", error);
            if (req.files) {
                const files = req.files;
                files.forEach((file) => {
                    fs_1.default.unlink(file.path, (err) => {
                        if (err)
                            console.error("Error deleting file:", err);
                    });
                });
            }
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
}
function getallProperties(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { id, propertyId, city, state, country, type, bhk, furnished, minPrice, maxPrice, listingType, } = req.query;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const filters = {};
            filters.city = {
                name: {
                    equals: String(city),
                    mode: "insensitive",
                },
            };
            if (state)
                filters.state = String(state);
            if (country)
                filters.country = String(country);
            if (type)
                filters.type = String(type);
            if (bhk)
                filters.bhk = parseInt(String(bhk));
            if (listingType)
                filters.listingType = String(listingType);
            if (furnished !== undefined)
                filters.furnished = String(furnished).toLowerCase() === "true";
            if (minPrice || maxPrice) {
                filters.price = {};
                if (minPrice)
                    filters.price.gte = parseFloat(String(minPrice));
                if (maxPrice)
                    filters.price.lte = parseFloat(String(maxPrice));
            }
            let properties;
            if (id) {
                properties = yield db_1.Client.property.findUnique({
                    where: {
                        id: String(id),
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
                properties = yield db_1.Client.property.findUnique({
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
            }
            else if (filters.city.name.equals != "undefined") {
                properties = yield db_1.Client.property.findMany({
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
            }
            else {
                properties = yield db_1.Client.property.findMany({
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
        }
        catch (error) {
            console.error("Error fetching properties:", error);
            res.status(500).send({
                success: false,
                message: "internal server error",
                error: error,
            });
        }
    });
}
function myProperties(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const properties = yield db_1.Client.property.findMany({
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
        }
        catch (error) {
            console.error("Error fetching properties:", error);
            res.status(500).send({
                success: false,
                message: "internal server error",
                error: error,
            });
        }
    });
}
function deleteProperty(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { id, listedById } = req.body;
            const userid = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (listedById != userid) {
                return res.status(403).send({
                    msg: "dont have permission",
                    listedById,
                    userid,
                });
            }
            yield db_1.Client.property.delete({
                where: {
                    id: id,
                },
            });
            res.send({
                msg: "property deleted successfully",
            });
        }
        catch (error) {
            res.status(500).send({
                msg: "internal server error",
                error
            });
        }
    });
}
function updateProperty(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            let propertyData;
            let existingImages = [];
            if (req.body.propertyData) {
                try {
                    propertyData = JSON.parse(req.body.propertyData);
                }
                catch (parseError) {
                    console.error("Error parsing propertyData JSON:", parseError);
                    return res.status(400).json({
                        error: "Invalid JSON in propertyData field",
                    });
                }
                if (req.body.existingImages) {
                    try {
                        existingImages = JSON.parse(req.body.existingImages);
                    }
                    catch (parseError) {
                        console.error("Error parsing existingImages JSON:", parseError);
                        existingImages = [];
                    }
                }
            }
            else {
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
            const { id, creatorId, city } = propertyData, updateData = __rest(propertyData, ["id", "creatorId", "city"]);
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
            const existingProperty = yield db_1.Client.property.findUnique({
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
            let cityRecord = existingProperty.city;
            if (city && city !== existingProperty.city.name) {
                cityRecord = yield db_1.Client.city.findFirst({
                    where: {
                        name: city,
                        state: updateData.state,
                        isActive: true,
                    },
                });
                if (!cityRecord) {
                    cityRecord = yield db_1.Client.city.create({
                        data: {
                            name: city,
                            state: updateData.state,
                            country: updateData.country || "India",
                        },
                    });
                }
            }
            const newImageData = [];
            const files = req.files;
            if (files && files.length > 0) {
                files.forEach((file, index) => {
                    const imageUrl = `${process.env.BACKEND_URL}/uploads/properties/${file.filename}`;
                    let descriptions = [];
                    if (req.body.imageDescriptions) {
                        const imageDescs = req.body.imageDescriptions;
                        if (typeof imageDescs === "string") {
                            if (imageDescs.startsWith("[")) {
                                try {
                                    descriptions = JSON.parse(imageDescs);
                                }
                                catch (e) {
                                    console.error("Failed to parse imageDescriptions as JSON:", e);
                                    descriptions = [];
                                }
                            }
                            else {
                                descriptions = imageDescs
                                    .split(",")
                                    .map((desc) => desc.trim());
                            }
                        }
                        else if (Array.isArray(imageDescs)) {
                            descriptions = imageDescs;
                        }
                    }
                    newImageData.push({
                        url: imageUrl,
                        description: descriptions[index] || "",
                    });
                });
            }
            const result = yield db_1.Client.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                yield prisma.property.update({
                    where: { id: id },
                    data: Object.assign(Object.assign({}, updateData), { cityId: cityRecord.id }),
                });
                if (existingImages.length > 0 || newImageData.length > 0) {
                    const currentImages = yield prisma.propertyImage.findMany({
                        where: { propertyId: id },
                    });
                    const existingImageIds = existingImages.map((img) => img.id).filter(Boolean);
                    const imagesToDelete = currentImages.filter((img) => !existingImageIds.includes(img.id));
                    if (imagesToDelete.length > 0) {
                        yield prisma.propertyImage.deleteMany({
                            where: {
                                id: {
                                    in: imagesToDelete.map((img) => img.id),
                                },
                            },
                        });
                        imagesToDelete.forEach((img) => {
                            const filename = img.url.split('/').pop();
                            if (filename) {
                                const filePath = path_1.default.join('uploads/properties', filename);
                                fs_1.default.unlink(filePath, (err) => {
                                    if (err)
                                        console.error("Error deleting file:", err);
                                });
                            }
                        });
                    }
                    for (const existingImg of existingImages) {
                        if (existingImg.id) {
                            yield prisma.propertyImage.update({
                                where: { id: existingImg.id },
                                data: { description: existingImg.description || "" },
                            });
                        }
                    }
                    if (newImageData.length > 0) {
                        yield prisma.propertyImage.createMany({
                            data: newImageData.map((img) => (Object.assign(Object.assign({}, img), { propertyId: id }))),
                        });
                    }
                }
                return yield prisma.property.findUnique({
                    where: { id: id },
                    include: {
                        images: true,
                        city: true,
                    },
                });
            }));
            res.status(200).json({
                success: true,
                message: "Property updated successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Error updating property:", error);
            if (req.files) {
                const files = req.files;
                files.forEach((file) => {
                    fs_1.default.unlink(file.path, (err) => {
                        if (err)
                            console.error("Error deleting file:", err);
                    });
                });
            }
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
}
function deleteFavourite(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { propertyId } = req.body;
            const userid = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userid) {
                return res.status(401).send({
                    msg: "Unauthorized: User ID not found",
                });
            }
            yield db_1.Client.favourite.delete({
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
        }
        catch (error) {
            res.status(500).send({
                msg: "Internal server Error",
                error,
            });
        }
    });
}
function addFavourite(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { propertyId } = req.body;
            const userid = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userid) {
                return res.status(401).send({
                    msg: "Unauthorized: User ID not found",
                });
            }
            const fav = yield db_1.Client.favourite.findUnique({
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
            yield db_1.Client.favourite.create({
                data: {
                    propertyId: propertyId,
                    userId: userid,
                },
            });
            res.send({
                msg: "added to favourite",
            });
        }
        catch (error) {
            res.status(500).send({
                msg: "Internal server Error",
                error: error,
            });
        }
    });
}
function raiseEnquiry(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const result = exports.EnquirySchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.format() });
            }
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res
                    .status(401)
                    .json({ user: req.user, error: "Unauthorized: User ID not found" });
            }
            const data = result.data;
            const Comments = yield db_1.Client.enquiry.create({
                data: Object.assign(Object.assign({}, data), { userId: userId }),
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
        }
        catch (error) {
            res.status(500).send({
                msg: "Internal server Error",
                error: error,
            });
        }
    });
}
function reply(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const result = exports.EnquiryReplySchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.format() });
            }
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res
                    .status(401)
                    .json({ user: req.user, error: "Unauthorized: User ID not found" });
            }
            const { enquiryId, message } = result.data;
            const originalEnquiry = yield db_1.Client.enquiry.findUnique({
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
                    error: "Forbidden: Only property owner can reply to enquiries about their properties",
                });
            }
            const reply = yield db_1.Client.enquiryReply.create({
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
        }
        catch (error) {
            console.error("Error sending reply:", error);
            res.status(500).send({
                success: false,
                msg: "Internal server Error",
                error: error,
            });
        }
    });
}
function getAllenquires(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { propertyId } = req.query;
            if (!propertyId) {
                return res.status(400).json({
                    error: "Property ID is required",
                });
            }
            const property = yield db_1.Client.property.findUnique({
                where: { id: propertyId },
            });
            if (!property) {
                return res.status(404).json({
                    error: "Property not found",
                });
            }
            const threadedEnquiries = yield db_1.Client.enquiry.findMany({
                where: {
                    propertyId: propertyId,
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
            const totalReplies = threadedEnquiries.reduce((sum, enquiry) => sum + enquiry.replies.length, 0);
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
        }
        catch (error) {
            console.error("Error fetching enquiries:", error);
            res.status(500).send({
                msg: "Internal server Error",
                error: error,
            });
        }
    });
}
function getAllCities(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const propertyType = typeof req.query.propertyType === "string" ? req.query.propertyType : "";
            const bhk = typeof req.query.bhk === "string" ? req.query.bhk : "";
            const listingType = typeof req.query.listingType === "string" ? req.query.listingType : "";
            const propertyFilters = {
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
                    }
                    else {
                        propertyFilters.bhk = bhkNumber;
                    }
                }
            }
            if (listingType && listingType !== "") {
                propertyFilters.ListingType = listingType.toUpperCase();
            }
            const matchingProperties = yield db_1.Client.property.findMany({
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
            const whereClause = Object.keys(propertyFilters).length === 1 && propertyFilters.available
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
            const cities = yield db_1.Client.city.findMany({
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
        }
        catch (error) {
            console.error("Error fetching cities:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch cities",
                error: error,
            });
        }
    });
}
function getAllFavourites(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ msg: "Unauthorized: user not found" });
            }
            const favourites = yield db_1.Client.favourite.findMany({
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
        }
        catch (error) {
            console.error("Error fetching favourites:", error);
            return res.status(500).json({
                msg: "Internal Server Error",
                error,
            });
        }
    });
}
