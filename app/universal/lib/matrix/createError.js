export const createError = name => {
  class CustomError extends Error {
    constructor(...args) {
      super(...args)
      this.name = name
      Error.captureStackTrace && Error.captureStackTrace(this, CustomError)
    }
  }

  return CustomError
}
