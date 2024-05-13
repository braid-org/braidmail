import * as braid from 'https://esm.sh/braid-http'
  
var feed = []

async function subscribe_to_feed (url, cb) {

    var retry = () => setTimeout(() => subscribe_to_feed(url, cb), 3000)

    var update_feed = (update) => {
        console.log('We got a new update!', update)

        if (update.body)
            // Got a whole new snapshot
            feed = JSON.parse(update.body)
        else
            // Got patches to append to the feed
            update.patches.forEach(p => {
                console.assert(p.unit === 'json')
                console.assert(p.range === '[-0:-0]')
                feed.push(JSON.parse(p.content))
            })

        console.log('Now feed is', feed)

        // Fetch the post and announce!
        fetch_posts(feed).then(posts => {
            console.log('announcing with', {posts, cb})
            cb(posts)
        })
    }


    try {
        var res = await braid.fetch('/feed', {subscribe: true})
    } catch (e) {
        console.log('try catch error! retrying...')
        retry()
    }

    console.log('Got res! subscribe is', res.headers.get('subscribe'))

    if (res.headers.has('subscribe'))
        res.subscribe(update_feed, (e) => {
            console.log('subscribe error!', e, 'retrying...')
            retry()
        })
    else {
        // Todo: add braid-http client library support to return array
        // of updates, or iterate through sequence of updates, in the
        // various forms that it can be encoded.
        //
        // Form 1:
        //  - Normal GET response with headers and body as update
        //
        // Form 2:
        //  - Get response with set of one or updates in body

        update_feed({
            version: res.version,
            body: await res.text()
        })

        // Polling!
        console.log('Polling!  Waiting 30 seconds...')
        retry()
    }
}

async function fetch_post (url) {
    // Todo: subscribe to changes in posts
    var res = await braid.fetch(url)
    if (res.status === 200)
        return await res.text()
    else
        return undefined
}
  
async function fetch_posts (feed) {
    var result = []
    for (var i=0; i<feed.length; i++) {
        var post = await fetch_post(feed[i].link)
        try {
            post = JSON.parse(post)
        } catch (e) {
            console.error('Error parsing post', {link: feed[i].link, post})
            continue
        }
        if (post)
            result.push({url: feed[i].link, ...post})
    }

    return result
}

function make_new_post ({subject, body}) {
    // Generate a random ID
    var id = Math.random().toString(36).substr(6)

    // Post it to the server
    braid.fetch('/post/' + id, {
        method: 'PUT',
        body: JSON.stringify({
            to:       ["rjaycarpenter@gmail.com","email@tychi.me"],
            cc:       ["toomim@gmail.com"],
            from:     ["email@tychi.me"],
            date:     Date.now(),
            subject:  subject,
            body:     body
        })
    })
}


export { subscribe_to_feed, make_new_post }