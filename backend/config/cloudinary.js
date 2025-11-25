import {v2 as cloudinary} from 'cloudinary'

const connectCloudinary = async () => {
  // If Cloudinary envs are not set, warn and do not configure — upload calls will fail with a descriptive message later
  if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY) {
    console.warn('Cloudinary environment variables are not set. Image upload will be disabled. Set CLOUDINARY_NAME, CLOUDINARY_API_KEY and CLOUDINARY_SECRET_KEY in your backend .env file.')
    return
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
  })
}

export default connectCloudinary