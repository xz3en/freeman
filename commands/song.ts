import * as Eris from "eris"
import { Octokit } from "octokit"
import BaseCommand from "../basecommand"

const octokit = new Octokit({
    auth: Bun.env["GITHUB_TOKEN"]
})

const response = await octokit.request("GET /repos/{owner}/{repo}/contents",{
    owner: "xz3en",
    repo: "hlmusic"
})

console.log(response.data)

export default class SongCommand extends BaseCommand {
    public name: string = "song"
    public description: string = "Group of subcommands for songs"
    public options: Eris.ApplicationCommandOptions[] = [
        {
            name: "play",
            description: "Play a song",
            type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "songname",
                    description: "A name of a song you want to play",
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                }
            ]
        },
        {
            name: "stop",
            description: "Stop song's playback",
            type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND
        }
    ]

    constructor(public client: Eris.Client) {
        super(client)
    }

    async execute(ctx: Eris.CommandInteraction) {
        await ctx.createMessage("Pong!")
    }
}