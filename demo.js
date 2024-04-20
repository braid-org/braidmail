var fs = require('fs'),
    app = require('express')(),
    braidmail = require('./index.js')

app.use(free_the_cors)

// Host some simple HTML
sendfile = (f) => (req, res) => res.sendFile(f, {root:'.'})
app.get('/', sendfile('demo.html'))

app.use(braidmail)

// Spin up the server
require('http')
    .createServer(app)
    .listen(7465, () => console.log('listening on 7465'))

// Free the CORS!
function free_the_cors (req, res, next) {
    console.log('free the cors!', req.method, req.url)
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
