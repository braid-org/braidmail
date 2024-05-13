var fs = require('fs'),
    express = require('express')
    app = express(),
    braidmail = require('./index.js'),
    bus = require('statebus')()

app.use(free_the_cors)
app.use((req, res, next) => {
    console.log(req.method, req.url)
    next()
})

// Host some simple HTML
sendfile = (f) => (req, res) => res.sendFile(f, {root:'.'})
app.get('/',               sendfile('client-demo-statebus.html'))
app.get('/raw',            sendfile('client-demo-raw.html'))
app.get('/feed-client.js', sendfile('feed-client.js'))

// // Serve users from Statebus
// app.all('/user*', bus.http_in)
// app.all('/current_user/*', bus.http_in)

// Serve js files
app.use('/js/statebus', express.static('node_modules/statebus'))

// Serve the braidmail state
app.use(braidmail)

// Spin up the server
require('http')
    .createServer(app)
    .listen(7465, () => console.log('listening on 7465'))

// Free the CORS!
function free_the_cors (req, res, next) {
    res.setHeader('Range-Request-Allow-Methods', 'PATCH, PUT')
    res.setHeader('Range-Request-Allow-Units', 'json')
    res.setHeader("Patches", "OK")
    var free_the_cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, HEAD, GET, PUT, UNSUBSCRIBE",
        "Access-Control-Allow-Headers": "subscribe, client, version, parents, merge-type, content-type, patches, cache-control, peer"
    }
    Object.entries(free_the_cors).forEach(x => res.setHeader(x[0], x[1]))
    if (req.method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
    } else
        next()
}
