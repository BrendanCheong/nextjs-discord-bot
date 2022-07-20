import { APIInteraction, APIInteractionResponse } from "discord-api-types/v10"
import { NextApiRequest, NextApiResponse } from "next"

export type DiscordInteractionApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse<APIInteractionResponse>,
  interaction: APIInteraction
) => void | Promise<void>
