import { Response } from 'express'
import { ErrorCodes, ModelResponse } from '../@types/model'

const responseModel = (resp: Response, modelResponse: ModelResponse): Response => {
  switch (modelResponse.errorCode) {
    case ErrorCodes.FieldsMissing:
    case ErrorCodes.NoUpdatesPerformed:
    case ErrorCodes.UnkownServerError:
    case ErrorCodes.NotAuthorized:
      return resp.status(401).json({ ...modelResponse, error: true })
    case ErrorCodes.NotFound:
      return resp.status(404).json({ ...modelResponse, error: true })
    case ErrorCodes.Created:
    case ErrorCodes.Success:
    default:
      return resp.status(200).json({ error: false, ...modelResponse })
  }
}

export default responseModel