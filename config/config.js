const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
    mongoUri: process.env.MONGODB_URI ||
      process.env.MONGO_HOST ||
      'mongodb://' + (process.env.IP || 'localhost') + ':' +
      (process.env.MONGO_PORT || '27017') +
      '/mernproject',
      /*Instead of hardcoding a server address in the code, we will set a config variable in
config.js, This will allow us to define and use separate absolute URLs for the API routes in
development and in production. */
    serverUrl: process.env.serverUrl || 'http://localhost:3000'
  }
  
  export default config
  