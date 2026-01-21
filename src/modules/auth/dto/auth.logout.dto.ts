import { RefreshToken } from "@prisma/client" 

export type LogoutDto = Pick<RefreshToken, "token"> 
