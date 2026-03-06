import { NODE_ENV } from "../../../config/config.service.js"

export function succsesResponse({res,statuscode=200,data}){
     return res.status(statuscode).json({statuscode,message:"done",data})

}

export const globalErrHandlling=(error,req,res,next)=>{
    return NODE_ENV =="dev"? 
    res
    .status(error.cause?.statuscode ?? 500)
    .json({mesgErr:error.message,error,stack:error.stack})
    : res
    .status(error.cause?.statuscode ?? 500)
    .json({mesgErr:error.message,error,stack:error.stack})  
    
}

export function notFoundExpention(msg) {

    throw new Error(msg,{cause:{statuscode:404}})
    
}
export function badRequstExpention(msg) {

    throw new Error(msg,{cause:{statuscode:400}})
    
}

export function conflictExpention(msg) {

    throw new Error(msg,{cause:{statuscode:409}})
    
}


