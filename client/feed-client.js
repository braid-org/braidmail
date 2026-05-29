(() => {

    var feed = [],
        posts = {},
        curr_version,
        peer = Math.random().toString(36).substr(3)


    async function subscribe_to_feed (url, cb) {
        console.log('Subscribing to feed at', url)

        var retry = () => setTimeout(() => subscribe_to_feed(url, cb), 3000)

        // Do the initial fetch
        try {
            console.log('Sending the fetch!')
            var res = await braid_fetch(url, {subscribe: true, parents: curr_version, peer})

            console.log('Got res! subscribe is', res.headers.get('subscribe'))

            if (res.status !== 200 && res.status !== 209)
                throw 'Bad response status for ' + url + ': ' + res.status

            // Server might support subscriptions
            if (res.headers.has('subscribe'))
                res.subscribe(patch_feed, (e) => {
                    console.log(`feed sub error: ${e.stack}`)
                    retry()
                })

            // Else just do polling
            else {
                // Incorporate this update we got
                patch_feed({
                    version: res.version,
                    body: await res.text()
                })

                // And poll again
                console.log('Polling!  Waiting 90 seconds...')
                setTimeout(retry, 90 * 1000)
            }
        }
        catch (e) { retry() }

        function patch_feed (update) {
            console.log('We got a new update!', update)

            if (update.body_text) {
                console.log('update body_text:', update.body_text)
                console.log('update json(body):', JSON.parse(update.body_text))
                // Got a whole new snapshot
                feed = JSON.parse(update.body_text)
                // Reset everything from scratch
                posts = {}
                curr_version = undefined
            } else
                // Got patches to append to the feed
                update.patches.forEach(p => {
                    console.assert(p.unit === 'json')
                    console.assert(p.range === '[-0:-0]')
                    feed = feed.concat(JSON.parse(p.content_text))
                })

            // Update the current version
            curr_version = update.version

            // Fetch the post and announce!
            fetch_posts(feed, cb)
        }
    }

    async function fetch_post (url, cb) {
        var retry = () => setTimeout(() => fetch_post(url, cb), 3000)
        // console.log('fetching post', url)
        try {
            var res = await braid_fetch(url, {subscribe: true})

            // Server might support subscriptions
            if (res.headers.has('subscribe'))
                res.subscribe(update => {
                    console.log('got update post!!', update)
                    if (update.status === '200')
                        cb(JSON.parse(update.body_text))
                    else if (update.status === '404') {
                        console.log('post', url, 'is 404')
                        cb(undefined)
                    }
                }, (er) => { console.error(er); retry() })

            // Else just do polling
            else {
                // Incorporate this update we got
                cb(JSON.parse(await res.text()))

                // And poll again
                console.log('Polling!  Waiting 90 seconds...')
                setTimeout(retry, 90 * 1000)
            }
        }
        catch (e) { console.error(e); retry() }
    }
    
    function fetch_posts (feed, cb) {
        // Initialize posts hash
        for (var i=0; i<feed.length; i++) {
            if (!feed[i]) continue        // Skip null posts

            var link = feed[i].link
            if (!(link in posts))
                posts[link] = undefined
        }

        // Fetch all missing posts
        for (let link in posts)
            if (!posts[link]) {
                posts[link] = 'pending'
                fetch_post(link, post => {
                    posts[link] = post
                    var new_feed = compile_posts()
                    cb(new_feed)
                })
            }

        function compile_posts () {
            var result = []
            for (var i=0; i<feed.length; i++) {
                if (!feed[i]) continue        // Skip null posts

                var post = posts[feed[i].link]
                if (post && post !== 'pending')
                    result.push({url: feed[i].link, ...post})
            }
            return result
        }
    }

    function make_new_post (host, params) {
        // Generate a random ID
        params.url = host + '/post/' + Math.random().toString(36).substr(6)
        put_post(params)
    }

    function put_post (params) {
        console.log('PUT post', params)

        params.date ??= new Date().getTime()
        params.from ??= ['anonymous']
        params.to   ??= ['public']
        params.cc   ??= []

        if (!params.url) throw new Error('Need a url to put!')
        if (params.body === undefined) throw new Error('Need a body to put!')

        // Filter it down
        var filtered_params =
            (   ({ from, to, cc, date, subject, body }) =>
                ({ from, to, cc, date, subject, body })     )(params)

        filtered_params['in-reply-to'] = params['in-reply-to']

        // Post it to the server
        braid_fetch(params.url, {
            method: 'PUT',
            body: JSON.stringify(filtered_params)
        })
    }

    window.feed = { subscribe_to_feed, make_new_post, put_post,
                    // And for debugging:
                    feed: () => feed,
                    posts: () => posts,
                    curr_version: () => curr_version,
                    peer
                  }
})()