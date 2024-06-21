var fs = require('fs'),
    express = require('express')
    braidmail = require('./index.js')

// Load config
try {
    var config = require('./config.js')
    console.log('Loaded config.js!')
} catch (e) {
    console.log('No custom config.js file')
    var config = {}
}


// If using h2, load express compatibility library
var app = config.h2 ? require('http2-express-bridge')(express) : express()
console.log('Serving via HTTP/' + (config.h2 ? '2' : '1'))


// Install basic middleware
app.use(free_the_cors)
app.use((req, res, next) => {
    console.log(req.method, req.url)
    next()
})

// Host some HTML
sendfile = (f) => (req, res) => res.sendFile(f, {root:'.'})
app.get('/',               sendfile('client-demo-statebus.html'))
app.get('/raw',            sendfile('client-demo-raw.html'))
app.get('/tag',            sendfile('client-demo-tag.html'))
app.get('/feed-client.js', sendfile('feed-client.js'))
app.use('/js/statebus',    express.static('node_modules/statebus'))
app.use('/tags',           express.static('tags'))
app.use('/sagas',          express.static('sagas'))
app.use('/tag.js',         sendfile('tag.js'))
app.get('/reply-icon.png', sendfile('reply-icon.png'))

// // Serve users from Statebus
// app.all('/user*', bus.http_in)
// app.all('/current_user/*', bus.http_in)

// Serve the braidmail state
app.use(braidmail)

// Spin up the server
var server = config.h2
    ? require('http2').createSecureServer(config.h2, app)
    : require('http').createServer(app)

server.listen(7465, () => console.log('listening on 7465'))

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
