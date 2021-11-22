import express from 'express'
import log from '../log/log'
const router = express.Router()


router.get('/', (req, res) => {
  log.info("Recieve", "test")
  res.status(200).json({ user: 'none' })
})

export default router
