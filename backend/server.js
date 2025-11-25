import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
// helpful startup checks for common missing envs that cause "Invalid Credentials"
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Tokens will fail to sign/verify. Set JWT_SECRET in your backend .env')
}
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.warn('WARNING: ADMIN_EMAIL or ADMIN_PASSWORD is not set — admin login will always return "Invalid Credentials" unless you set them in your environment (see backend/.env.example).')
}
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api end point
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)


app.get('/', (req, res) => {
  res.send('Api working...')
})

app.listen(port, () => console.log('Server started', port)) 