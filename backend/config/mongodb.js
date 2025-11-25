import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on('connected', () => console.log('Database Connected'))
  // Expect MONGODB_URI to be a full connection string OR a base URI without DB.
  // If a DB isn't present in the URI and MONGODB_DB is set, append it safely.
  const rawUri = process.env.MONGODB_URI
  if (!rawUri) {
    console.error('MONGODB_URI is not set. Please set it in your environment (see backend/.env.example).')
    throw new Error('Missing MONGODB_URI')
  }

  // Detect whether the URI already has a database path (a slash followed by db name)
  // We look for a slash after the host part (ignore protocol `mongodb+srv://` / `mongodb://`).
  const hasDbInUri = /:\d+\/.+|mongodb\+srv:\/\/.+\/.+/.test(rawUri) || /mongodb(:|\+srv):\/\/.+\/.+/.test(rawUri)

  let finalUri = rawUri
  // Normalize duplicate slashes in path portion (but preserve protocol '://')
  // Example: prevent situations like '...mongodb.net//prescripto' which create invalid DB names
  finalUri = finalUri.replace(/([^:])\/\/{2,}/g, '$1/')
  if (!hasDbInUri) {
    // use MONGODB_DB if available, otherwise refuse to connect to avoid creating invalid namespace
    const dbName = process.env.MONGODB_DB
    // If no dbName provided, fall back to the old default 'prescripto' (but warn)
    let dbToUse = process.env.MONGODB_DB
    if (!dbToUse) {
      dbToUse = 'prescripto'
      console.warn("MONGODB_URI does not include a database name and MONGODB_DB is not set — defaulting to 'prescripto'.")
      console.warn("Consider setting MONGODB_URI (with DB name) or MONGODB_DB to avoid surprises. See backend/.env.example and README.md.")
    }

    // ensure no duplicate slashes
    finalUri = rawUri.replace(/\/+$/, '') + '/' + dbToUse.replace(/^\/+/, '')
  }

  // Try connecting with retries — DNS or Atlas can be temporarily unavailable.
  const maxAttempts = 6
  const baseDelayMs = 2000

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(finalUri)
      console.log('Database Connected')
      return
    } catch (err) {
      const last = attempt === maxAttempts
      console.error(`Mongo connection attempt ${attempt}/${maxAttempts} failed: ${err && err.message ? err.message : err}`)
      if (last) {
        console.error('All Mongo connection attempts failed. See the message above for details. Check Atlas network access (IP whitelist), DNS resolution and that MONGODB_URI is correct.')
        throw err
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1)
      console.warn(`Retrying Mongo connection in ${Math.round(delay / 1000)}s...`)
      // sleep
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

export default connectDB