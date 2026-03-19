import express from "express"
import * as userservice from "./user.service.js"
import { auth } from "../../Middleware/auth.middleware.js"
import { tokenType } from "../../Common/Enums/token.enums.js"
import { authorization } from "../../Middleware/authorization.midlleware.js"
import { RoleEnum } from "../../Common/Enums/user.enums.js"
import { allowedFileFormates, localUpload } from "../../Common/Services/Multer/multer.confing.js"
import { validation } from "../../Middleware/validation.middleware.js"
import { covPicSchema, GetAnthorUserProfile, ProfilePicSchema } from "./user.validation.js"
import * as redisMethods from "../../Common/Services/Redis/redis.service.js"
const userRouter = express.Router()


userRouter.get("/",auth(),authorization() ,async (req, res, next) => {
    //    console.log();
       
    try {
        const result = await userservice.getById(req.user)
        return res.status(201).json({ mes: "done", result })

    } catch (error) {
        next(error)

    }
})
userRouter.post("/renew-token",auth(tokenType.refresh) ,async (req, res, next) => {
    //    console.log();
       
    try {
        const result = await userservice.renewToken(req.user)
        return res.status(201).json({ mes: "done", result })

    } catch (error) {
        next(error)

    }
})

userRouter.patch("/upload-mainPic",auth(),localUpload({folderName:"user",allowedFormates:allowedFileFormates.img}).single("profilePicture"),
validation(ProfilePicSchema),async (req,res,next)=>{
       console.log(req.file);
       
 try {
        const result = await userservice.uploadProfilePic(req.user._id,req.file)
        return res.status(201).json({ mes: "done", result })
 
    } catch (error) {
        next(error)

    }

})

userRouter.patch("/upload-covPic",auth(),localUpload({folderName:"user",allowedFormates:allowedFileFormates.img}).array("covPic",2),
validation(covPicSchema),async (req,res,next)=>{
       console.log(req.files);
       
 try {
        const result = await userservice.uploadCovPic(req.user._id,req.files)
        return res.status(201).json({ mes: "done", result })
 
    } catch (error) {
        next(error)

    }

})

userRouter.get("/get-profile/:profileId",validation(GetAnthorUserProfile),async (req,res,next) => {

         
 try {
        const result = await userservice.getProfile(req.params.profileId)
        return res.status(200).json({ mes: "done", result })
 
    } catch (error) {
        next(error)

    }
    
})

userRouter.delete("/profile-picture",auth(),async (req,res,next)=>{
    try{
        const result = await userservice.removeProfilePic(req.user._id)
        return res.status(200).json({ mes: "done", result })
    }catch(error){
        next(error)
    }
})

userRouter.get("/admin/profile-visits/:profileId",
auth(),
authorization(RoleEnum.Admin),
validation(GetAnthorUserProfile),
async (req,res,next)=>{
    try{
        const visits = await userservice.getProfileVisits(req.params.profileId)
        return res.status(200).json({ mes: "done", visits })
    }catch(error){
        next(error)
    }
})

userRouter.post("/logout",auth(),async (req,res,next) => {

         
    try {
           const result = await userservice.logOut(req.user._id,req.payload,req.body.logoutOptions)
           return res.status(200).json({ mes: "done", result })
    
       } catch (error) {
           next(error)
   
       }})


export default userRouter

