import React from "react"
import { InferGetServerSidePropsType } from "next"
import { createGlobalCommand, getGlobalCommands } from "services/discord"
import { ApplicationCommandType } from "discord-api-types/v10"

export const getServerSideProps = async () => {
  try {
    await createGlobalCommand({
      name: "randompic",
      description: "Get a random picture",
      options: [
        {
          name: "type",
          description: "Get a good random picture!",
          type: 3,
          required: true,
          choices: [
            { name: "cat", value: "cat" },
            { name: "dog", value: "dog" },
            { name: "generic", value: "picsum" },
          ],
        },
      ],
      type: ApplicationCommandType.ChatInput,
      default_member_permissions: null
    })
    
    await createGlobalCommand({
      name: "ping",
      description: "Ping pong! I'll respond with pong.",
      type: ApplicationCommandType.ChatInput,
      default_member_permissions: null
    })
    await createGlobalCommand({
      name: "test",
      description: "This is a testing command!",
      type: ApplicationCommandType.ChatInput,
      default_member_permissions: null
    })

    await createGlobalCommand({
      name: "test2",
      description: "TEST2 TEST2 TEST2",
      type: ApplicationCommandType.ChatInput,
      default_member_permissions: null
    })

    await createGlobalCommand({
      name: "bool",
      description: "edit this boolean command!",
      type: ApplicationCommandType.ChatInput,
      default_member_permissions: null
    })

    const { data } = await getGlobalCommands();
    console.log(data);
    return { props: { data } }
  } catch (err) {
    console.error(err)
    return { props: { data: null } }
  }
}

const IndexPage = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div>
      <h1>Dashboard</h1>
      <h2>i.e. you could build a dashboard here... we'll just fetch all the slash commands the bot has registered</h2>
      <div>
        <a href="https://discord.gg/NmXuqGgkb3">
          <img
            alt="Discord invite"
            src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white"
            style={{ borderRadius: "4px", marginRight: "16px" }}
          />
        </a>
        <a href="https://discord.gg/NmXuqGgkb3">Try it out on this Discord server</a>
        <p>or</p>
        <a
          style={{ display: "block" }}
          href="https://discord.com/api/oauth2/authorize?client_id=837427503059435530&permissions=2147483648&scope=bot%20applications.commands"
        >
          Add NextBot to your server!
        </a>
      </div>
      {data && data.length > 0 ? (
        <div>
          <h3>All commands</h3>
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>name</th>
                <th>description</th>
                <th>default permission</th>
                <th>options</th>
              </tr>
            </thead>
            <tbody>
              {data.map((command) => (
                <tr key={command.id}>
                  <td>{command.id} </td>
                  <td>{command.name} </td>
                  <td>{command.description} </td>
                  <td>{String(command.default_permission)}</td>
                  <td>{command.options ? <div>{JSON.stringify(command.options[0])}</div> : "No options"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        "No commands found"
      )}
    </div>
  )
}

export default IndexPage
