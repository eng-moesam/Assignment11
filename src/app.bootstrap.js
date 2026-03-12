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
// import { globalErrHandlling } from "./Common/Response/response.js";
// import dotenv from 'dotenv'
// import path from "path";
// dotenv.config({path:path.resolve("./config/.env.dev")})

async function bootstrap(){
  
const app =express()
const port = PORT;
await connectDB()
// await sendEmail({to:"moesam224466@gmail.com",subject:"this is my code",text:"hi iam from saraha app",html:temblateEmail(12344),
//     attachments:[{
//         path:resolve("./data.txt"),
//         filename:"dummy_text.txt"
//     }]
// })
app.use(cors())

 
app.use(express.json())
app.use("/uploads",express.static(path.resolve("./uploads")))
app.use("/auth",authRouter)
app.use("/user",userRouter)


app.use(globalErrHandlling)

app.listen(port,()=>{
    console.log(`sever is running ${port}`);
})
   
}
export default bootstrap;
