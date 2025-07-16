export class RecordNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RecordNotFoundError'
  }
}

export class MissingDataProviderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MissingDataProviderError'
  }
}