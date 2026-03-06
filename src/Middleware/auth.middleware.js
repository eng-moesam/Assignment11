import { tokenType } from "../Common/Enums/token.enums.js";
import { decodedToken, getSignature, verfiyToken } from "../Common/Security/token.js";
import * as dbRepo from "../DB/db.repostory.js"
import userModel from "../DB/Models/User.Model.js";
export  function auth(tokenTypeParam=tokenType.access){
  return async (req,res,next)=>{
        const {authorization} = req.headers
      
     const[BearerKey,tokenKey]=  authorization.split(" ")
   
       if(BearerKey != "Bearer"){

        throw new Error("invalid Bearer Key ",{cause:{statuscode:404}})

       }
  const decoded=  decodedToken(tokenKey)


  const [userRole,TokenType] = decoded.aud

   if (TokenType != tokenTypeParam){
    throw new Error("invalid token type",{cause:{statuscode:404}});
   }
  
   const{accessSignature,refreshSignature}= getSignature(userRole)


     
  const verfiy = verfiyToken({token:tokenKey,
    signature:tokenTypeParam==tokenType.access?accessSignature:refreshSignature})

    const user = await dbRepo.findById({model:userModel,id:verfiy.sub})
    if (!user){
      throw new Error("invalid acount",{cause:{statuscode:401}})
    }
    req.user=user
    next()
  }  

  
}