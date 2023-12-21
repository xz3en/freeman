import * as Eris from "eris"

export default class BaseCommand {
    public name: string = "command"
    public description: string = "this is a command"
    public options: Eris.ApplicationCommandOptions[] = []

    constructor(public client: Eris.Client) {}

    async execute(ctx: Eris.CommandInteraction) {
        await ctx.createMessage("Hello!")
    }
}