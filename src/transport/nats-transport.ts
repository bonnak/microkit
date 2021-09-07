import nats, {Msg, NatsConnection, StringCodec} from 'nats'
import NatsStreaming, {Message, Stan} from 'node-nats-streaming'

interface IConfigOption {
  servers: string[] | string
  clusterId: string
  clientId: string
  queueGroup: string
}

const stringCodec = StringCodec()

const connectNatStreamingAsync = (
  clusterId: string,
  clientId: string,
  url: string,
): Promise<Stan> => {
  const client = NatsStreaming.connect(clusterId, clientId, {url})

  return new Promise((resolve, reject) => {
    client.on('connect', () => resolve(client))
    client.on('error', err => reject(err))
  })
}

class NatsTransport {
  public client!: NatsConnection
  public streamingClient!: Stan
  public queueGroup!: string

  async connect(opts: IConfigOption): Promise<void> {
    this.client = await nats.connect({servers: opts.servers})
    this.streamingClient = await connectNatStreamingAsync(
      opts.clusterId,
      opts.clientId,
      typeof opts.servers === 'string' ? opts.servers : opts.servers[0],
    )
    this.queueGroup = opts.queueGroup
  }

  async close(): Promise<void> {
    await this.client.close()
    this.streamingClient.close()
  }

  async request(cmd: string, payload: Object | string): Promise<Msg> {
    const payloadStringify =
      typeof payload === 'string' ? payload : JSON.stringify(payload)

    const result = await this.client.request(
      cmd,
      stringCodec.encode(payloadStringify),
    )

    // eslint-disable-next-line no-console
    console.log(`Command request: ${cmd} - ${payloadStringify}`)

    return result
  }

  async reply(
    cmd: string,
    callback: (data: string) => Promise<string | object> | string | object,
  ): Promise<void> {
    const subscription = this.client.subscribe(cmd, {queue: this.queueGroup})

    const run = async () => {
      for await (const msg of subscription) {
        // eslint-disable-next-line no-console
        console.log(
          `[Command reply: ${msg.reply} - ${stringCodec.decode(msg.data)}`,
        )

        try {
          const result = await callback(stringCodec.decode(msg.data))
          const stringifyResult = (
            result === 'object' ? JSON.stringify(result) : result
          ) as string
          msg.respond(stringCodec.encode(stringifyResult))
        } catch (err: unknown) {
          if (err instanceof Error) {
            // eslint-disable-next-line no-console
            console.error(`Error Message reply: ${cmd} - ${err.message}`)
          }
        }
      }
    }

    await run()
  }

  publish(subject: string, payload: object): Promise<void> {
    const payloadStringify = JSON.stringify(payload)

    return new Promise((resolve, reject) => {
      this.streamingClient.publish(subject, payloadStringify, err => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error(`Error publish message: ${subject} - ${err.message}`)
          return reject(err)
        }

        // eslint-disable-next-line no-console
        console.log(`Message published: ${subject} - ${payloadStringify}`)
        resolve()
      })
    })
  }

  subscribe(
    subject: string,
    callback: (data: object, msg: Message) => unknown,
  ): void {
    const subscription = this.streamingClient.subscribe(
      subject,
      this.queueGroup,
      this.streamingClient
        .subscriptionOptions()
        .setDeliverAllAvailable()
        .setManualAckMode(true)
        .setAckWait(5000)
        .setDurableName(this.queueGroup),
    )

    subscription.on('message', (msg: Message) => {
      // eslint-disable-next-line no-console
      console.log(
        `Message received: ${subject} / ${this.queueGroup} - ${msg.getData()}`,
      )

      const data = msg.getData() as string
      const parsedData = JSON.parse(data) as object
      callback(parsedData, msg)
    })
  }
}

export default new NatsTransport()
