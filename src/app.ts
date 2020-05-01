import express from 'express'
import compression from 'compression'
import cors from 'cors'
import morgan from './logging/morgan'
import index from './routes/index'

const app = express()

// Middleware chain
app.use(express.json())
app.use(compression())
app.use(cors())

// Logging
app.use(morgan)

// Routes
app.use('/', index)

export default app
