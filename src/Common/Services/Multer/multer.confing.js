import multer from 'multer'
import {randomUUID} from "node:crypto"
import path from 'node:path'
import { existsSync,mkdirSync } from 'node:fs'
import { Error } from 'mongoose'

// export const randomUUId= randomUUID()
export const allowedFileFormates ={
    img:["image/png","image/jbg","image/jpeg"],
    video:["video/mp4",'video/mkv']
}
export function localUpload({folderName="GeneralFiles",allowedFormates=allowedFileFormates.img,fileSize=10}){
    const  storage = multer.diskStorage({
    destination:function(req,file,cb){
          const fullPath =`./uploads/${folderName}`
        if(!existsSync(fullPath)){
            mkdirSync(fullPath,{recursive:true})
        }
        cb(null,path.resolve(fullPath))
    },
    filename:function(req,file,cb){
      const fileName = randomUUID() + "_" +file.originalname 
      console.log({file});
      file.finalPath=`uploads/${folderName}/${fileName}`
        
      cb(null,fileName)
    }

})
  function fileFilter(req,file,cb){
    
    if(!allowedFormates.includes(file.mimetype)){
        return cb(new Error("invalid format",{cause:{statuscode:404}}),true)
    }
    return cb(null,true)
        
  }
return multer({ storage: storage ,fileFilter,limits:{fileSize:fileSize*1024*1024}})

}

