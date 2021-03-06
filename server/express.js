import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import Template from './../template'
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
import mediaRoutes from './routes/media.routes'

// modules for server side rendering
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import MainRouter from './../client/MainRouter'
import { StaticRouter } from 'react-router-dom'

import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles'
import theme from './../client/theme'
//end

//For SSR with data
import { matchRoutes } from 'react-router-config'
import routes from './../client/routeConfig'
import 'isomorphic-fetch'
//end

/*This isomorphic-fetch integration will make sure that the read fetch method, or
any other fetch method that we defined for the client, can now be used on the server
as well */

//comment out before building for production
import devBundle from './devBundle'

const CURRENT_WORKING_DIR = process.cwd()
const app = express()

//comment out before building for production
devBundle.compile(app)

//For SSR with data
 /*We will use the routes defined in the route configuration file to look for a matching route when the server receives any request. If a match is found, we will use the
corresponding loadData method declared for this route in the configuration to retrieve the necessary data, before it is injected into the server-rendered markup
representing the React frontend. */
const loadBranchData = (location) => {
  /*This method uses matchRoutes from react-router-config, and the routes
defined in the route configuration file, to look for a route matching the incoming
request URL, which is passed as the location argument */
  const branch = matchRoutes(routes, location)
  const promises = branch.map(({ route, match }) => {
    /*If a matching route is found, then any associated loadData method will be executed to return a Promise
containing the fetched data, or null if there were no loadData methods. */
    return route.loadData
      ? route.loadData(branch[0].match.params)
      : Promise.resolve(null)
  })
  return Promise.all(promises)
}

// parse body params and attache them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compress())
// secure apps by setting various HTTP headers
app.use(helmet())
// enable CORS - Cross Origin Resource Sharing
app.use(cors())

app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')))

// mount routes
app.use('/', userRoutes)
app.use('/', authRoutes)
app.use('/', mediaRoutes)

app.get('*', (req, res) => {
  const sheets = new ServerStyleSheets()
  const context = {}

  /*The loadBranchData defined here will need to be called whenever the server receives a request, so if any matching route is found, we can fetch the relevant data and inject it
into the React components while rendering server side. */
   loadBranchData(req.url).then(data => {
     /*we use ReactDOMServer to convert the React app to markup. */
     /*We utilize the loadBranchData method to retrieve the relevant data for the requested view, then pass this data as a prop to the MainRouter component */
       const markup = ReactDOMServer.renderToString(
        sheets.collect(
         <StaticRouter location={req.url} context={context}>
             <ThemeProvider theme={theme}>
                  <MainRouter data={data}/>
             </ThemeProvider>
          </StaticRouter>
        )
      )
       if (context.url) {
        return res.redirect(303, context.url)
       }
       const css = sheets.toString()
       res.status(200).send(Template({
          markup: markup,
          css: css
       }))
   }).catch(err => {
      res.status(500).send({"error": "Could not load React view with data"})
  })
})

// Catch unauthorised errors
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({"error" : err.name + ": " + err.message})
  }else if (err) {
    res.status(400).json({"error" : err.name + ": " + err.message})
    console.log(err)
  }
})

export default app
