import "dotenv/config"

// Libraries
import * as Eris from "eris"

// Node built-ins
import * as fs from "node:fs/promises"
import { parse } from "node:path"

// Modules
import BaseCommand from "./basecommand"

const PORT = 3000

const commands = new Map<string,BaseCommand>()
 
async function updateCommands() {
    const files = await fs.readdir("./commands")
    const rawCommands: Eris.ApplicationCommandStructure[] = []

    for (const file of files) {
        const filename = parse(file).name
        const command: BaseCommand = new (await import(`./commands/${filename}`)).default(client)
        commands.set(command.name,command)
        rawCommands.push({
            name: command.name,
            description: command.description,
            options: command.options,
            type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT
        })
        console.log(`Parsed ${command.name} command`)
    }

    client.bulkEditCommands(rawCommands)
}

const client = new Eris.Client(
    Bun.env["BOT_TOKEN"] || "",
    {
        intents: Eris.Constants.Intents.all
    }
)

client.on("ready",async () => {
    await updateCommands()
    console.log("Ready!")
})

client.on("interactionCreate",(ctx) => {
    if (ctx instanceof Eris.CommandInteraction) {
        const command = commands.get(ctx.data.name)
        if (!command) return
        try {
            command.execute(ctx)
        } catch (err) {
            console.log(err)
        }
    }
})

Bun.serve({
    port: PORT,
    hostname: "0.0.0.0",
    fetch(request) {
        return new Response("Works")
    }
})

client.connect()