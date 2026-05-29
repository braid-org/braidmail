// Statebus variables
var bus = require('statebus')(),
    state = bus.state,
    link  = bus.link,
    raw   = bus.raw

// HTTP variables
var app = require('express')(),
    port = 3008

// == Set things up! ==

// Create the HTTP server
var http_server = require('http').createServer()
require('braid-http').http_server(http_server)
http_server.listen(port, () => console.log('listening on', port))

// Setup the statebus!
bus.http = app              // Some statebus libraries like to interact with HTTP
bus.http_server = http_server
bus.honk = 3                // Print handy debugging output
// bus.libs.file_store()       // Persist state onto disk
bus.libs.serve_clientjs()
bus.libs.serve_client_coffee()

// Setup express
http_server.on('request', app)

var root = require('path').resolve(__dirname + '/..')

// Setup routs for client code
bus.http.get('/', (req, res) => res.sendFile(root + '/client/index.html'))
bus.http.get('/feed-client.js', (req, res) => res.sendFile(root + '/client/feed-client.js'))
bus.http.get('/reply-icon.png', (req, res) => res.sendFile(root + '/client/reply-icon.png'))
bus.http.use('/static', require('express').static(root + '/client/static'))

// Serve other state from our statebus
bus.http.all(['/feed', '/post/:id', '/users'], bus.libs.http_in)



// == Define the Getters and Setters ==

bus('feed', {
    get: key        => {
        var result = [{link: '/post/1'}]
        console.log('getting feed!', result);
        return result
    },
    set: (key, val) => state[key] = val
})

// Local posts
// bus('post/:id', {
//     get: key        => state[key],
//     set: (key, val) => state[key] = val
// })

state['post/1'] = {subject: 'first post!', body: 'yeah this is a post',
                   from: 'mike@braid.org', date: new Date().getTime()}

bus('users', {
    get: () => []
})