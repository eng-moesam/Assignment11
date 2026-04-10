
import joi from "joi"
import { GenderEnum } from "../Common/Enums/user.enums.js"
import { Types } from "mongoose"


  export function validation(schema){
    
  
    return (req,res,next)=>{
   
           const valdationErrors=[]
        for (const schemakey of Object.keys(schema)) {
            
            const validateResult = schema[schemakey].validate(
                req[schemakey],{abortEarly:false})
                  // console.log({validateResult})
                req["v" +schemakey]=validateResult.value
                 if(validateResult.error?.details.length >0){
                // throw new Error(validateResult.error);
                valdationErrors.push(validateResult.error)
            }
            }

           

             if(valdationErrors.length>0){ 
            return res.status(201).json({ mes: "errr",error: valdationErrors }) }
       next();
    }
}


export const commonValditions ={
    // user:name /^[A-Z]{1}[a-z]{1,24}\s[a-z]{1,24}$/gm
    //phone: /^01[0-25]\d{8}$/gm
    //phone: /^(\+201|00201|01)(0|1|2|5)\d{8}$/gm
    //email: /^[a-zA-Z0-9]{3,25}@(gmail|yahoo|outlook|icloud)(.com|.net|.co|.eg){1,4}$/gm
    //email: /^\w{3,25}@(gmail|yahoo|outlook|icloud)(.com|.net|.co|.eg){1,4}$/gm
    //password: /(?=.*[a-z/)(?=.*[A-Z])(?.*\d)(?=.*\W).{6,16}/gm

    userName:joi.string().pattern(new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}$/)),
    email: joi.string().pattern(new RegExp(/^\w{3,25}@(gmail|yahoo|outlook|icloud)(.com|.net|.co|.eg){1,4}$/)).trim(),
    password:joi.string().pattern(new RegExp(/(?=.*[a-z/)(?=.*[A-Z])(?=.*\d)(?=.*\W).{6,16}/)),
    confrimPassword:joi.string().valid(joi.ref("password")),
    phone:joi.string().pattern(new RegExp(/^(\+201|00201|01)(0|1|2|5)\d{8}$/)),
    DOB:joi.date(),
    gender:joi.string().valid(...Object.values(GenderEnum)),
    otp:joi.string().pattern(new RegExp(/\d{6}/)),
    id:joi.string().custom(ValditionObjectId)

}

export function ValditionObjectId(value,helpers){
      if(!Types.ObjectId.isValid(value)){
        return helpers.message("invalid object Id")
      }
    }