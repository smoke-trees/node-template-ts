import { Response } from 'express'
import { ErrorCodes, ModelResponse } from '../@types/model'

const responseModel = (resp: Response, modelResponse: ModelResponse): Response => {
  switch (modelResponse.errorCode) {
    case ErrorCodes.FieldsMissing:
      return resp.status(400).json({ error: true, ...modelResponse })
    case ErrorCodes.NoUpdatesPerformed:
      return resp.status(500).json({ error: true, ...modelResponse })
    case ErrorCodes.UnknownServerError:
      return resp.status(500).json({ error: true, ...modelResponse })
    case ErrorCodes.NotAuthorized:
      return resp.status(401).json({ ...modelResponse, error: true })
    case ErrorCodes.NotFound:
      return resp.status(404).json({ ...modelResponse, error: true })
    case ErrorCodes.Created:
      return resp.status(201).json({ error: false, ...modelResponse })
    case ErrorCodes.Success:
    default:
      return resp.status(200).json({ error: false, ...modelResponse })
  }
}

export default responseModel
