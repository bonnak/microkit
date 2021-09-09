import transport from '../transport/nats-transport'

export abstract class Event {
  abstract subject: string

  publish(data: object): Promise<void> {
    return transport.publish(this.subject, data)
  }
}
