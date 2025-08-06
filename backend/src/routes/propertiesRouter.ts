import { Router } from "express";
import { addFavourite, deleteFavourite, deleteProperty, getAllCities, getAllenquires, getAllFavourites, getallProperties, myProperties, raiseEnquiry, registerProperty, reply, updateProperty, uploadMultipleImages } from "../controller/propertiesController";
import { authMiddleware } from "../middleware/authMiddleware";
import { uploadImage } from "../config/multer";
export const propertyRouter=Router();
propertyRouter.get("/properties",getallProperties)
propertyRouter.get('/message',getAllenquires)
propertyRouter.get('/get-cities',getAllCities)

propertyRouter.use(authMiddleware)
propertyRouter.post('/register_property',           
  uploadImage.array('images', 10),  
  registerProperty             
);
propertyRouter.get('/my_properties',myProperties)
propertyRouter.delete('/delete_Property',deleteProperty)
propertyRouter.get('/favourites',getAllFavourites)
propertyRouter.put('/update_Property', uploadImage.array('images', 10), updateProperty);
propertyRouter.post('/add_fav',addFavourite)
propertyRouter.delete('/del_fav',deleteFavourite)
propertyRouter.post('/message',raiseEnquiry)
propertyRouter.post('/reply_message',reply)