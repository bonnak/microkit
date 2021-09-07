import nats from '../../transport/nats-transport'

interface IMessage {
  ack(): void
}

abstract class Consumer {
  abstract subject: string
  abstract onMessage: (data: object, msg: IMessage) => unknown

  subscribe(): void {
    nats.subscribe(this.subject, this.onMessage)
  }
}

export default Consumer
