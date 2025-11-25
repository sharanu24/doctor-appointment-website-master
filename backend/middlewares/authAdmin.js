import jwt from 'jsonwebtoken'

// admin authentication middleware
const authAdmin = async (req, res, next) => {

  try {

    const { atoken } = req.headers
    if (!atoken) {
      return res.json({ success: false, message: 'Not Authorized Login Again' })
    }

    // Allow a development fallback if env vars are not set
    const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'devsecret' : undefined)
    if (!jwtSecret) return res.json({ success: false, message: 'Not Authorized Login Again' })

    let token_decode
    try {
      token_decode = jwt.verify(atoken, jwtSecret)
    } catch (err) {
      // return a clearer message for invalid tokens/signatures
      console.warn('JWT verification failed for admin token:', err.message)
      return res.json({ success: false, message: 'Invalid or expired admin token — please login again' })
    }

    const defaultAdminEmail = 'admin@example.com'
    const defaultAdminPassword = 'adminPassword123'
    const adminEmail = process.env.ADMIN_EMAIL || (process.env.NODE_ENV !== 'production' ? defaultAdminEmail : undefined)
    const adminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== 'production' ? defaultAdminPassword : undefined)

    if (!adminEmail || !adminPassword) return res.json({ success: false, message: 'Not Authorized Login Again' })

    // token_decode is expected to be an object { email }
    if (!token_decode || token_decode.email !== adminEmail) {
      return res.json({ success: false, message: 'Not Authorized Login Again'})
    }

    next()

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

export default authAdmin