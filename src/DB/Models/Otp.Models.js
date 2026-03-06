import mongoose from "mongoose";


   const otpSchema = new mongoose.Schema({
       email:{
        type:String,
        unique:true,
        required:true
    },
    otp:{
        type:String
    }
  
   },{

    timestamps:true
   })
   otpSchema.index({createdAt: 1}, {expireAfterSeconds: 300})


   export const OtpMpdel = mongoose.model("otp",otpSchema)