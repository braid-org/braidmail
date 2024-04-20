import express from 'npm:express'
import braidmail from './braidmail.js'

const port = 8465
const app = express()

app.use(free_the_cors)

// Host some simple HTML
const sendfile = (f) => (req, res) => res.sendFile(f, {root:'.'})
app.get('/', sendfile('demo.html'))

app.use('/public', express.static('public'))
app.use(braidmail)

app.listen();
console.log('client running on: ', port)

// Free the CORS!
function free_the_cors (req, res, next) {
    console.log('free the cors!', req.method, req.url)
    res.setHeader('Range-Request-Allow-Methods', 'PATCH, PUT')
    res.setHeader('Range-Request-Allow-Units', 'json')
    res.setHeader("Patches", "OK")
    const free_the_cors = {
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
