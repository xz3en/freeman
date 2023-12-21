import * as Eris from "eris"
import BaseCommand from "../basecommand"

export default class PingCommand extends BaseCommand {
    public name: string = "ping"
    public description: string = "Pong!"
    public options: Eris.ApplicationCommandOptions[] = []

    constructor(public client: Eris.Client) {
        super(client)
    }

    async execute(ctx: Eris.CommandInteraction) {
        await ctx.createMessage("Pong!")
    }
}