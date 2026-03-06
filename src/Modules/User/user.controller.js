import express from "express"
import * as userservice from "./user.service.js"
import { auth } from "../../Middleware/auth.middleware.js"
import { tokenType } from "../../Common/Enums/token.enums.js"
import { authorization } from "../../Middleware/authorization.midlleware.js"
import { RoleEnum } from "../../Common/Enums/user.enums.js"

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

export default userRouter

