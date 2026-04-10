import express from "express"
import authRouter from "./Modules/Auth/auth.controller.js";
import { NODE_ENV, PORT, TOKEN_SIGNATURE_ADMIN, TOKEN_SIGNATURE_ADMIN_Refresh, TOKEN_SIGNATURE_USER, TOKEN_SIGNATURE_USER_Refresh } from "../config/config.service.js";
import connectDB from "./DB/connection.js";
import { globalErrHandlling } from "./Common/Response/response.js";
import userRouter from "./Modules/User/user.controller.js";
import cors from "cors"
import { sendEmail } from "./Common/Services/Email/send.email.js";
import path, {resolve} from "node:path"
import { temblateEmail } from "./Common/Services/Email/email.temblate.js";
import { testRedisConnection } from "./Common/Services/Redis/redis.connection.js";
import messageRouter from "./Modules/Messages/message.controller.js";
import helmet from "helmet";
import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import * as MethodRedis from "./Common/Services/Redis/redis.service.js"
// import { globalErrHandlling } from "./Common/Response/response.js";
// import dotenv from 'dotenv'
// import path from "path";
// dotenv.config({path:path.resolve("./config/.env.dev")})
import geoip from 'geoip-lite'

// async function bootstrap(){
  
const app =express()
const port = PORT;
await connectDB()
await testRedisConnection()
const corsOptions={
    origin:["http://localhost:3000"]
  }
// await sendEmail({to:"moesam224466@gmail.com",subject:"this is my code",text:"hi iam from saraha app",html:temblateEmail(12344),
//     attachments:[{
//         path:resolve("./data.txt"),
//         filename:"dummy_text.txt"
//     }]
// })

app.set("trust proxy", true)
app.use(cors(),helmet())
app.use(rateLimit(
    {
        windowMs: 60*1000,
        limit:(req,res)=>{
           
        const geo = geoip.lookup(req.ip);
        console.log(geo);
        const isEgypt = geo?.country === "EG";
        if (!isEgypt) {
          return res.status(429).json({
            message: "not allowed from out egypt",
          });
        }
        return geo.country =="EG"?7:3

        },
        handler:(req,res)=>{
          
          
            return res.status(404).json("try alater")
        },
        requestPropertyName:"rateLimit",
        keyGenerator:(req)=>{
            const ip = ipKeyGenerator(req.ip)
            return `${ip}-${req.path}`
        },
        store:{
            incr:async(key,cb)=>{
                    const hits = await  MethodRedis.incr(key)
                    if (hits == 1) {
                        
                        await MethodRedis.setExpire(key,60)
                    }
                    cb(null,hits)
            }
            ,
            async decrement(key){
                const isExists= await MethodRedis.exists(key)

                if (isExists) {

                    await MethodRedis.decr(key)
                    
                }
            }
        
        },
        // skipFailedRequests:true,
        skipSuccessfulRequests:true
    }
))



app.get("/",(req,res)=>{
    return res.json({msg:"welcome to server side apis"})
})
 
app.use(express.json())
app.use("/uploads",express.static(path.resolve("./uploads")))
app.use("/auth",authRouter)
app.use("/user",userRouter)
app.use("/mesg",messageRouter)



app.use(globalErrHandlling)
if (process.env.NODE_ENV !== "production") {
  const port = PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// app.listen(port,()=>{
//     console.log(`sever is running ${port}`);
// })
   
// }
// export default bootstrap;

export default app
