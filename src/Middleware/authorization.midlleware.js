import { RoleEnum } from "../Common/Enums/user.enums.js";


 export function authorization(roles = [RoleEnum.User]) {
    return (req,res,next)=>{

        if (!roles.includes(req.user.role)) {
         throw new Error("you dont have a premision ",{cause:{statuscode:403}})            
        }

        next()
    }
 }