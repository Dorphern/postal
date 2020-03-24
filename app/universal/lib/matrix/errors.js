import { createError } from './createError'

export const RoomAliasInUseError = createError('RoomAliasInUseError')
export const MalformedError = createError('MalformedError')
export const UnknownTokenError = createError('UnknownTokenError')
export const UnknownError = createError('UnknownError')

export const getMatrixRequestError = ({ errcode, error: message }) => {
  const error = matrixErrorFromErrCode(errcode)
  error.message = message
  return error
}

const matrixErrorFromErrCode = errcode => {
  switch (errcode) {
    case 'M_BAD_JSON':
    case 'M_NOT_JSON':
      return new MalformedError()
    case 'M_ROOM_IN_USE':
      return new RoomAliasInUseError()
    case 'M_UNKNOWN_TOKEN':
      return new UnknownTokenError()
    default:
      return new UnknownError()
  }
}
