import express from 'express'
import { config } from './config/index.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { httpLogger } from './utils/httpLogger.js'
import requestIdMiddleware from './middlewares/requestId.js'
import router from './routes/index.js'
import { initializePassport } from './config/passport.js'

const app = express()

app.use(cors({
    origin: config.nodeEnv === 'production' ? config.frontendUrl : "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
}))


app.use(requestIdMiddleware)
app.use(httpLogger)
app.use(express.json())
app.use(express.urlencoded({extended : true }))
app.use(cookieParser())

initializePassport()

app.use(router)


export default app