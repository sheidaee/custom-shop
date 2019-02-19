const cookieParser = require('cookie-parser')
require('dotenv').config({ path: 'variables.env' })
const jwt = require('jsonwebtoken')

const createServer = require('./createServer')
const db = require('./db')

const server = createServer()

// use express middleware to handle cookies (JWT)
 server.express.use(cookieParser())

// use express middleware to populate current user
// decode the JWT so we can get the user Id in each request
server.express.use((req, res, next) => {
  // this is the power of cookie parser - it comes along each req
  const {token} = req.cookies
  
  if (token) {
    const {userId} = jwt.verify(token, process.env.APP_SECRET)
    // put the user id onto req
    req.userId = userId
  }
  
  next();
})

// Create a middleware that populates the user on each request
server.express.use(async(req, res, next) => {
  // if they aren't logged in, skip this
  if (!req.userId) {
    return next()
  }
  const user = await db.query.user(
    {where: { id: req.userId}},
    '{id, permissions, email, name}'
  )
  req.user = user
  
  next();
})

server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL
  }
}, deets => {
   console.log(`Server is now running on port http://localhost:`);  // ${deets.port} 
})