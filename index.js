var fs = require('fs')

// Default data
var resources = {
    '/feed': [
        {link: '/post/1'},
        {link: '/post/2'},
        {link: '/post/3'}
    ],
    '/post/1': {subject: 'First!', body: 'First post OMGGG!!!!'},
    '/post/2': {subject: 'Second...', body: `Once upon a time,
I ate a big fish.
It was really tasty.`},
    '/post/3': {subject: 'Tois.', body: "It's nice when things come in threes."}
}
var curr_version = () => [ (resources['/feed'].length + '') ]


function add_client_id (req) {
    req.headers.client ??= Math.random().toString(36).substr(3)
}


// Load real data from db
try {
    var resources = JSON.parse(fs.readFileSync('db'))
} catch (e) {}
function save_db () { fs.writeFileSync('db', JSON.stringify(resources, null, 2)) }


// Subscriptions
var subscriptions = {}
var rhash = (req) => JSON.stringify([req.headers.client, req.url])


// HTTP Routes
function getter (req, res) {
    // Make sure URL is valid
    if (!(req.url in resources)) {
        res.statusCode = 404
        res.end()
        return
    }

    // Set headers
    res.setHeader('content-type', 'application/json')
    if (req.url === '/feed') {
        res.setHeader('Version-Type', 'appending-array')
    }        

    // Honor any subscription request
    if (req.subscribe) {
        console.log('Incoming subscription!!!')
        res.startSubscription({ onClose: _=> delete subscriptions[rhash(req)] })
        subscriptions[rhash(req)] = res
        console.log('Now there are', Object.keys(subscriptions).length, 'subscriptions')
    } else
        res.statusCode = 200

    // Send the current version
    res.sendUpdate({
        version: curr_version(),
        body: JSON.stringify(resources[req.url])
    })

    if (!req.subscribe)
        res.end()
}

function handler (req, res, next, options = {}) {
    var feed_name = '/feed' || options.feed_name,
        post_name = '/post/' || options.post_name

    require('braid-http').http_server(req, res)
    add_client_id(req)

    // Feed only supports get
    if (req.url === feed_name && req.method === 'GET') {
        getter(req, res)
    }

    else if (req.url.startsWith(post_name)) {

        // GET /post/*
        if (req.method === 'GET')
            getter(req, res)

        // PUT /post/*
        else if (req.method === 'PUT') {
            var is_new_post = !(req.url in resources)

            // Download the post body
            var body = ''
            req.on('data', chunk => {body += chunk.toString()})
            req.on('end', () => {

                // Now update the post
                resources[req.url] = JSON.parse(body)

                // Update subscribers
                post_changed(req)

                // Update the feed
                if (is_new_post)   // Update this when we delete posts
                    append_to_feed(req)

                res.end()
            })
        }            

        // DELETE /post/*
        else if (req.method === 'DELETE') {
            if (!req.url in resources)
                res.status = 404
            else {
                delete resources[req.url]
                res.status = 200
                post_changed(req)
            }
        }
    }
}

// Add a post to the feed.  Update all subscribers.
function append_to_feed (post_req) {
    var post_entry = {link: post_req.url}

    // Add the post to the feed
    resources['/feed'].push(post_entry)

    // Save the new database
    save_db()

    // Tell everyone about it
    for (var k in subscriptions) {
        var [client, url] = JSON.parse(k)
        if (client !== post_req.headers.client && url === '/feed') {
            console.log('Telling client', client, 'about the new', post_entry, 'in /feed')
            subscriptions[k].sendUpdate({
                version: curr_version(),
                patches: [{
                    unit: 'json',
                    range: '[-0:-0]',
                    content: JSON.stringify(post_entry)
                }]
            })
        }
    }
}

// Notify everyone when a post changes
function post_changed (req) {
    // Save the new database.
    save_db()

    // Tell everyone
    for (var k in subscriptions) {
        var [client, url] = JSON.parse(k)
        if (client !== req.headers.client && url === req.url) {
            console.log('Yes! Telling', {client, url})
            subscriptions[k].sendUpdate({
                version: curr_version(),
                body: JSON.stringify(resources[req.url])
            })
        }
    }
}

module.exports = handler
