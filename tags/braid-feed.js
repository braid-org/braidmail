  import tag from '@braid/tag'
  import * as client from '@braid/mail'
  import { showModal } from '@plan98/modal'
  
  const $ = tag('braid-feed', { feed: [] })

  client.subscribe_to_feed('/feed', feed => {
    $.teach({ feed })
  })

  $.draw(() => {
    const { feed } = $.learn()
    const form = `
      <form id="new-post">
      <textarea name=subject placeholder=subject></textarea>
      <textarea name=body placeholder=body></textarea>
      <button type=submit>new post</button>
      <button class="help">Get Help</button>
      </form>
    `

    const thread = feed.map(post => {
      return `
        <p>
          <a href='${post.url}'>
            <code style='font-size:10'>${post.url}</code>
          </a>
          <br>
          <b>${post.subject || ''}</b>
          <br>
          ${post.body}
        </p>
      `
    }).join('\n')

    return `
      ${thread}
      ${form}
    `
  })

  $.when('submit', '#new-post', (event) => {
    event.preventDefault()
    const { subject, body } = event.target

    client.make_new_post('', {
      subject: subject.value,
      body: body.value
    })

    subject.value = ''
    body.value = ''
  })

  $.when('click', '.help', () => {
    showModal(`
      <div style="place-self: center; max-height: 80vh; height: 100%; padding: 1rem; width: 100%; max-width: 55ch; border-radius: 2rem; background: rgba(255,255,255,.85); color: rgba(0,0,0,.85);">
        Help...
      </div>
    `)
  })

