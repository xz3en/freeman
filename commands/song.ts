import * as Eris from "eris"
import { Octokit } from "octokit"
import jsmediatags from "jsmediatags"

import { exists, readFile } from "node:fs/promises"

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
} else {
    const rawdata = JSON.parse(await readFile("./music.json","utf-8"))

    for (const [key,value] of Object.entries(rawdata)) {
        music_urls.set(key,String(value))
    }
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

    async playSong(ctx: Eris.CommandInteraction) {
        if (!ctx.data.options || !ctx.member?.voiceState.channelID) return

        await ctx.acknowledge()
        
        const option: any = ctx.data.options[0]
        const query = option["options"][0]["value"]

        console.log(query)


        /* const voiceConnection = await this.client.joinVoiceChannel(ctx.member.voiceState.channelID,{
            selfDeaf: true
        }) */
    }

    async stopSong(ctx: Eris.CommandInteraction) {
        ctx.createMessage("wovie, stop command")
    }

    async execute(ctx: Eris.CommandInteraction) {
        if (!ctx.data.options || !ctx.member) return
        const name = ctx.data.options[0].name
        if (name == "play") {
            this.playSong(ctx)
        } else if (name == "stop") {
            this.stopSong(ctx)
        }
    }
}