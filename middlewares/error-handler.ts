import { AxiosError } from "axios"
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next"

const withErrorHandler = (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    return await fn(req, res)
  } catch (err) {
    if (err instanceof AxiosError) {
      const statusCode = err.response?.status || 500
      const message = err.message || "Oops, something went wrong!"
      res.status(statusCode).json({ statusCode, message })
    } else {
      console.log('Something went wrong with the error')
    }
  }
}

export default withErrorHandler
