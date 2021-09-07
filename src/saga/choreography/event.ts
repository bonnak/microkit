import nats from '../../transport/nats-transport'

abstract class Event {
  abstract subject: string

  publish(data: object): Promise<void> {
    return nats.publish(this.subject, data)
  }
}

export default Event
