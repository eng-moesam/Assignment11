import { compare, hash } from "bcrypt";
import { SALT_ROUNDS } from "../../../config/config.service.js";

export async function hashOperation({plaintext , round = SALT_ROUNDS}) {

   return await hash( plaintext , round )
    
}
export async function compareOperation({plaintext,hashedvalue}) {

    return await compare(plaintext,hashedvalue)
    
}