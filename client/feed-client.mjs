// feed-client.js expects a global braid_fetch; provide it for module consumers.
import * as braid from 'https://esm.sh/braid-http@~1.3.40'
window.braid_fetch = braid.fetch

import './feed-client.js'
// Edit this export map to stay in sync with feed-client.js
const { subscribe_to_feed, make_new_post, put_post, feed, posts, curr_version, peer } = window.feed
export { subscribe_to_feed, make_new_post, put_post, feed, posts, curr_version, peer }
