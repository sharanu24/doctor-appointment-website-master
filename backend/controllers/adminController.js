import validator from "validator"
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"

// API for adding doctor
const addDoctor = async (req, res) => {

  try {

    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
    const imageFile = req.file

    // checking for all data to add doctor
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.json({ success: false, message: 'Missing Details' })
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' })
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: 'Please enter a strong password' })
    }

    // hashing doctor password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // upload image to cloudinary
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY || !process.env.CLOUDINARY_NAME) {
      return res.json({ success: false, message: 'Cloudinary not configured. Set CLOUDINARY_NAME, CLOUDINARY_API_KEY and CLOUDINARY_SECRET_KEY in your backend .env to upload images.' })
    }

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
    const imageUrl = imageUpload.secure_url

    const doctorData = {
      name, email, image: imageUrl, password: hashedPassword, speciality,
      degree, experience, about, fees, address: JSON.parse(address), date: Date.now()
    }

    const newDoctor = new doctorModel(doctorData)
    await newDoctor.save()

    res.json({ success: true, message: 'Doctor Added' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API for admin Login
const loginAdmin = async (req, res) => {
  try {

    const { email, password } = req.body

    // allow a developer friendly default when env vars are not set (non-production only)
    const defaultAdminEmail = 'admin@example.com'
    const defaultAdminPassword = 'adminPassword123'

    const adminEmail = process.env.ADMIN_EMAIL || (process.env.NODE_ENV !== 'production' ? defaultAdminEmail : undefined)
    const adminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== 'production' ? defaultAdminPassword : undefined)

    // secret fallback for development only
    const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'devsecret' : undefined)

    if (!adminEmail || !adminPassword) return res.json({ success: false, message: 'Invalid Credentials' })

    if (email === adminEmail && password === adminPassword) {
      // sign a JSON payload to make verification stable and extensible
      if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
        console.warn('Using development fallback JWT_SECRET to sign admin token')
      } else {
        console.debug && console.debug('Signing admin token using environment JWT_SECRET')
      }

      const token = jwt.sign({ email }, jwtSecret)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: 'Invalid Credentials' })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {

  try {

    const doctors = await doctorModel.find({}).select('-password')
    res.json({ success: true, doctors })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {

  try {

    const appointments = await appointmentModel.find({})
    res.json({ success: true, appointments })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {

  try {

    const { appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData
    const doctorData = await doctorModel.findById(docId)
    let slots_booked = doctorData.slots_booked

    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: 'Appointment Cancelled' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {

  try {

    const doctors = await doctorModel.find({})
    const users = await userModel.find({})
    const appointments = await appointmentModel.find({})

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      lastestAppointments: appointments.reverse().slice(0, 5)
    }

    res.json({ success: true, dashData })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message})
  }

}
      
export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard }