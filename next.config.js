/** @type {import('next').NextConfig} */
const fs = require('fs')
const path = require('path')

let httpsConfig = {}

// Check if SSL certificates exist
const certPath = path.join(process.cwd(), 'cert.pem')
const keyPath = path.join(process.cwd(), 'key.pem')

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  httpsConfig = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  }
}

const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  ...(Object.keys(httpsConfig).length > 0 && {
    server: {
      https: httpsConfig
    }
  })
}

module.exports = nextConfig

