import * as Eris from "eris"
import { Octokit } from "octokit"
import jsmediatags from "jsmediatags"

import { exists } from "node:fs/promises"

import BaseCommand from "../basecommand"
import { TagType } from "jsmediatags/types"

const octokit = new Octokit({
    auth: Bun.env["GITHUB_TOKEN"]
})

const music_urls = new Map<string,string>()

function readMediaTags(path: string): Promise<TagType["tags"]> {
    return new Promise((resolve, reject) => {
        jsmediatags.read(path,{
            onSuccess: function(tag) {
                resolve(tag.tags)
            },
            onError: function(err) {
                reject(err)
            }
        })
    })
}

if (!(await exists("./music.json"))) {
    console.log("No cache found, fetching stuff")
    const response = await octokit.request("GET /repos/{owner}/{repo}/contents",{
        owner: "xz3en",
        repo: "hlmusic"
    })
    
    for (const rawfile of response.data) {
        const filename: string = rawfile["name"]
        const fileurl: string = "https://github.com/xz3en/hlmusic/raw/main/" + encodeURIComponent(filename)
        
        const tags = await readMediaTags(fileurl)

        music_urls.set(tags.title || filename,fileurl)
    }

    Bun.write("./music.json",JSON.stringify(Object.fromEntries(music_urls)))

    console.log("Cached every song")
}

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