import * as express from 'express'
import ParseServer, { ParseGraphQLServer } from 'parse-server'
import cloud from './cloud'
import logger from './logger'

const app = express()
const port = process.env.NODE_PORT
const appId = process.env.APP_ID
const liveQueryArray = process.env.LIVE_QUERIES ? process.env.LIVE_QUERIES.split(',') : []
const deleteOrphans = process.env.DELETE_ORPHANS ? process.env.DELETE_ORPHANS.split(',') : []

// Parse Server configuration
const parseServer = new ParseServer({
    appId: appId,
    serverURL: `http://0.0.0.0:${port}`,
    publicServerURL: `${process.env.SERVER_URL}/app/${appId}`,
    databaseURI: `${process.env.DB_URL}/parse_${appId}?authSource=admin`,
    masterKey: process.env.MASTER_KEY,
    liveQuery: { classNames: liveQueryArray }
})

// GraphQL configuration
const parseGraphQLServer = new ParseGraphQLServer(parseServer, {
    graphQLPath: '/graphql'
})

app.use('/', parseServer.app)
parseGraphQLServer.applyGraphQL(app)

// Initialize the cloud code
cloud.init(deleteOrphans)

// Starting server
app.listen(port, () => {
    logger.info('🤖 Parse Server -%s- is running in path /app/%s', appId, appId)
})