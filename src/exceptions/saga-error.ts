export class SagaError extends Error {
  public sagaId: string
  public header: object
  public payload: object

  constructor(sagaId: string, header: object, payload: object) {
    super('SagaError')

    this.sagaId = sagaId
    this.header = header
    this.payload = payload
  }
}
