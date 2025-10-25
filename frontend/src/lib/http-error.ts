export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message = 'HTTP Error',
  ) {
    super(message)
    this.name = 'HttpError'
  }
}
