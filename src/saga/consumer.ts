import transport from '../transport/nats-transport'

interface IMessage {
  ack(): void
}

export abstract class Consumer {
  abstract subject: string
  abstract onMessage: (data: object, msg: IMessage) => unknown

  subscribe(): void {
    transport.subscribe(this.subject, this.onMessage)
  }
}
