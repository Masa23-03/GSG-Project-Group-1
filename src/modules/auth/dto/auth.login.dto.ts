import { User } from "@prisma/client"

export type LoginDTO = Pick<User, "email" | "password"> 
