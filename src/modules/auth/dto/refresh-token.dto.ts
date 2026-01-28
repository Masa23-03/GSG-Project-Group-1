import { RefreshToken } from "@prisma/client"

export type RefreshTokenDTO = {
    refreshToken: RefreshToken['token']
}