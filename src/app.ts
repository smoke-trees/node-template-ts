import express from 'express'
import compression from 'compression'
import cors from 'cors'
import context from '@smoke-trees/smoke-context'
import './config'
import morgan from './log/morgan'
import index from './routes/index'
import './database/connection'
// import yaml from 'yamljs'
// import path from 'path'
// import SwaggerUi from 'swagger-ui-express'

const app = express()

// Middleware chain
app.use(express.json())
app.use(compression())
app.use(context({ headerName: 'test' }))
app.use(cors())

// Logging
app.use(morgan)

// const swaggerDocument = yaml.load(path.resolve(__dirname, '..', 'docs', 'build', 'docs.yaml'))

// app.use('/docs', SwaggerUi.serve)
// app.get('/docs', SwaggerUi.setup(swaggerDocument))

// Routes
app.use('/', index)

export default app
