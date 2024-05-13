import * as braid from 'https://esm.sh/braid-http?dev'
  
var feed = [],
    posts = {},
    curr_version,
    peer = Math.random().toString(36).substr(3)


async function subscribe_to_feed (url, cb) {

    var retry = () => setTimeout(() => subscribe_to_feed(url, cb), 3000)

    // Do the initial fetch
    try {
        var res = await braid.fetch(url, {subscribe: true, parents: curr_version, peer})

        console.log('Got res! subscribe is', res.headers.get('subscribe'))

        // Server might support subscriptions
        if (res.headers.has('subscribe'))
            res.subscribe(patch_feed, retry)

        // Else just do polling
        else {
            // Incorporate this update we got
            patch_feed({
                version: res.version,
                body: await res.text()
            })

            // And poll again
            console.log('Polling!  Waiting 30 seconds...')
            setTimeout(retry, 30 * 1000)
        }
    }
    catch (e) { retry() }

    function patch_feed (update) {
        console.log('We got a new update!', update)

        if (update.body) {
            // Got a whole new snapshot
            feed = JSON.parse(update.body)
            // Reset everything from scratch
            posts = {}
            curr_version = undefined
        } else
            // Got patches to append to the feed
            update.patches.forEach(p => {
                console.assert(p.unit === 'json')
                console.assert(p.range === '[-0:-0]')
                feed = feed.concat(JSON.parse(p.content))
            })

        // Update the current version
        curr_version = update.version

        // Fetch the post and announce!
        fetch_posts(feed, cb)
    }
}

async function fetch_post (url) {
    console.log('fetching post', url)
    // Todo: subscribe to changes in posts
    var res = await braid.fetch(url)
    if (res.status === 200)
        return await res.text()
    else
        return undefined
}
  
function fetch_posts (feed, cb) {
    // Initialize posts hash
    for (var i=0; i<feed.length; i++) {
        var link = feed[i].link
        if (!(link in posts))
            posts[link] = undefined
    }

    // Fetch all missing posts
    for (let link in posts)
        if (!posts[link])
            fetch_post(link).then( post => {
                try {
                    post = JSON.parse(post)
                } catch (e) {
                    console.error('Error parsing post', {link, post})
                    return
                }
                posts[link] = post
                var new_feed = compile_posts()
                cb(new_feed)
            })

    function compile_posts () {
        var result = []
        for (var i=0; i<feed.length; i++) {
            var post = posts[feed[i].link]
            if (post)
                result.push({url: feed[i].link, ...post})
        }
        return result
    }
}

function make_new_post (host, {subject, body = '', date, from, to, cc}) {
    // Generate a random ID
    var id = Math.random().toString(36).substr(6)

    date ??= new Date().getTime()
    from ??= ['anonymous']
    to   ??= ['public']
    cc   ??= []

    // Post it to the server
    braid.fetch(host + '/post/' + id, {
        method: 'PUT',
        body: JSON.stringify({ from, to, cc, date, subject, body })
    })
}


export { subscribe_to_feed, make_new_post }