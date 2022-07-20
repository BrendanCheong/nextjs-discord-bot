import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { customAlphabet } from "nanoid"
import { APIChatInputApplicationCommandInteraction, APIEmbed, APIInteraction, APIInteractionResponse } from "discord-api-types/v10"
import withDiscordInteraction from "middlewares/discord-interaction"
import withErrorHandler from "middlewares/error-handler"
import { discordClient } from "services/discord"

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz-", 16)

const BASE_RESPONSE = { type: 4 }
const INVALID_COMMAND_RESPONSE = { ...BASE_RESPONSE, data: { content: "Oops! I don't recognize this command." } }
const PING_COMMAND_RESPONSE = { ...BASE_RESPONSE, data: { content: "Pong" } }

const baseRandomPicEmbed = {
  title: "Random Pic",
  description: "Here's your random pic!",
}

const generateEmbedObject = (source: string, path: string): APIEmbed => {
  return {
    ...baseRandomPicEmbed,
    fields: [{ name: "source", value: source }],
    image: {
      url: `${source}${path}`,
    },
  }
}

const getEmbed = async (value: string) => {
  switch (value) {
    case "cat":
      const {
        data: { url },
      } = await axios.get("https://cataas.com/cat?json=true")
      return generateEmbedObject("https://cataas.com", url)
    case "dog":
      try {
        const {
          data: { message },
        } = await axios.get("https://dog.ceo/api/breeds/image/random")
        return {
          ...baseRandomPicEmbed,
          fields: [{ name: "source", value: "https://dog.ceo/api" }],
          image: { url: message },
        }
      } catch (err) {
        return { ...baseRandomPicEmbed, description: "Oh no! Error getting random dog." }
      }

    default:
      return generateEmbedObject("https://picsum.photos", `/seed/${nanoid()}/500`)
  }
}

// disable body parsing, need the raw body as per https://discord.com/developers/docs/interactions/slash-commands#security-and-authorization
export const config = {
  api: {
    bodyParser: false,
  },
}

const handler = async (
  _: NextApiRequest,
  res: NextApiResponse<APIInteractionResponse>,
  interaction: APIInteraction
) => {
  console.log(interaction);
  const {
    data: { name, options }
  } = interaction as APIChatInputApplicationCommandInteraction

  switch (name) {
    // trpc idea? can do something like await fetch(origin_api_name/api/trpc/router.${name})
    // with trpc you can define exactly what kind of input schema you want together with
    // discord-api-types to support that schema
    // might be better to do case statements instead, its easier to add new commands?
    case "ping":
      return res.status(200).json(PING_COMMAND_RESPONSE)
    case "randompic":
      if (!options) {
        throw new Error()
      }
      return res.status(200).json({
        type: 4,
        data: {
          // @ts-ignore
          embeds: [await getEmbed(options[0].value)],
        },
      })
    case "test":
      return res.status(200).json({...BASE_RESPONSE, data: { content: "test command received!" }});
    
    case "test2":
      return res.status(200).json({...BASE_RESPONSE, data: { content: "test2 command received!" }});
    
    case "bool":
      // in this case we execute a lambda first
      // but then immediately return type 5
      // after lambda is done, we then update the interaction with the actual response
      // allows us a 15 minute command, actually limited to 10 second nextjs serverless timeout for free tier
      // fakeAsync(interaction).then((token) => console.log(token));
      //! could we pair this with trpc?
      //by default it sends a type 5 message, but then we hit the trpc endpoint to edit that message...
      // middleware is to auth and send type 5 if auth is true, then after auth we hit the trpc endpoint
      //? problem lies in error handling, since we will always send a status 200 type 5
      //? can solve this if catch error and set message to error message
      fakeAsync(interaction);
      return res.status(200).json({...BASE_RESPONSE, type: 5});

    default:
      return res.status(200).json(INVALID_COMMAND_RESPONSE)
  }
}

// create a fake async function that takes 5 seconds to run and returns the interaction token string
const fakeAsync = async (interaction: APIInteraction) => {
  const url = `/webhooks/${process.env.DISCORD_APP_ID}/${interaction.token}`;
  console.log(url);
  const response = {
    tts: false,
    content: 'Hello world!',
    embeds: [],
    allowed_mentions: [],
  };
  console.log(await discordClient.post(url, response));
  return interaction.token;
}

export default withErrorHandler(withDiscordInteraction(handler))
