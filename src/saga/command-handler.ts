import transport from '../transport/nats-transport'

export class CommandHandler {
  async reply(
    cmd: string,
    callback: (data: string) => Promise<string | object> | string | object,
  ): Promise<void> {
    await transport.reply(cmd, callback)
  }
}
