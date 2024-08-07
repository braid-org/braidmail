import module from '@braid/tag'

const currentWorkingDirectory = '/sagas/'

const lolol = [
  {
    label: 'Braid',
    lol: [
      {
        label: 'Encryption',
        laugh: 'encryption.saga'
      },
      {
        label: 'Mail',
        laugh: 'start.saga'
      },
    ]
  },
]
const { laugh } = lolol[0].lol[0]
let lastLaugh = laugh
let lastSidebar = false
let lastAvatar = false

const $ = module('parental-controls', {
  content: '...',
  laugh,
  sidebar: false,
  avatar: false,
  lololID: 0,
  lolID: 0
})

outLoud(laugh, 0, 0)

$.draw((target) => {
  const { sessionId, companyName, companyEmployeeId } = getSession()
  const { avatar, sidebar, laugh, saga, lolID, lololID } = $.learn()
  target.beforeUpdate = scrollSave
  target.afterUpdate = scrollSidebar

  const authChip = sessionId ? `
    <img data-avatar src="/cdn/tychi.me/photos/unprofessional-headshot.jpg" alt="" />
    <div class="tongue">
      <div class="quick-auth">
        <div class="console">
          <label>Company</label>
          <div class="companyName">
            ${companyName}
          </div>
        </div>
        <div class="player">
          <label>Identity</label>
          <div class="companyEmployeeId">
            ${companyEmployeeId}
          </div>
        </div>
        <button class="auth-button" data-disconnect>
          Disconnect
        </button>
      </div>
    </div>
  ` : `
    <img data-avatar src="/cdn/tychi.me/photos/professional-headshot.jpg" alt="" />
    <div class="tongue">
      <form method="post" class="quick-auth">
        <div class="console">
          <label>Company</label>
          <input type="text" placeholder="console" name="companyName" />
        </div>
        <div class="player">
          <label>Identity</label>
          <input placeholder="player" name="companyEmployeeId" />
        </div>
        <div class="password">
          <label>Password</label>
          <input type="password" name="password" />
        </div>

        <button class="auth-button" type="submit">
          Connect
        </button>
      </form>
    </div>
  `


  if(laugh !== lastLaugh && target.querySelector('iframe')) {
    lastLaugh = laugh
    target.querySelector('iframe').src = saga
    target.querySelector('.-active').classList.remove('-active')
    target.querySelector(`.control-tab[data-lol="${lolID}"][data-lolol="${lololID}"]`).classList.add('-active')
    return
  }

  if(sidebar !== lastSidebar && target.querySelector('[data-sidebar]')) {
    lastSidebar = sidebar
    target.querySelector('[data-sidebar]').innerText = sidebar ? 'Play' : 'Pause'
    sidebar
      ? target.querySelector('data-tooltip').classList.add('sidebar')
      : target.querySelector('data-tooltip').classList.remove('sidebar')
    return
  }

  if(avatar !== lastAvatar && target.querySelector('[data-sidebar]')) {
    lastAvatar = avatar
    avatar
      ? target.querySelector('.control-tab-list').classList.add('multiplayer')
      : target.querySelector('.control-tab-list').classList.remove('multiplayer')
    return
  }

  return `
    <data-tooltip class="control ${sidebar ? 'sidebar': ''}" aria-live="assertive">
      <div class="control-toggle">
        <button data-sidebar>
          Pause
        </button>
      </div>
      <div class="control-tab-list ${avatar ? 'multiplayer': ''}">
        <div class="control-avatar">
          ${authChip}
        </div>
        ${lolol.map((x, index) => {
          return `
            <div class="heading-label">${x.label}</div>
            ${lol(x.lol, index)}
          `
        }).join('')}

        <hr>
      </div>
      <div class="control-view ${sidebar ? '' : 'no-sidebar' }">
        <iframe src="${saga}" title="Okay"></iframe>
      </div>
    </data-tooltip>
  `
})

function scrollSave() {
  const list = this.querySelector('.control-tab-list')
  if(!list) return
  this.dataset.top = list.scrollTop
}

function scrollSidebar() {
  const list = this.querySelector('.control-tab-list')
  if(!list) return
  list.scrollTop = this.dataset.top
}

function chat(group) {
  return `
    <button class="control-tab" data-group-id="${group.groupId}">
      ${group.groupName}
    </button>
  `
}

function lol(laughs, lolol) {
  const { lololID, lolID } = $.learn()
  return laughs.map((y, lol) => {
    const isActive = lololID === lolol && lolID === lol
    return `
      <button class="control-tab ${isActive ? '-active' : '' }" data-lolol="${lolol}" data-lol="${lol}" data-laugh="${y.laugh}">
        ${y.label}
      </button>
    `
  }).join('')
}

$.when('click', '[data-laugh]', async (event) => {
  const { laugh, lol, lolol } = event.target.dataset
  const lolID = parseInt(lol, 10)
  const lololID = parseInt(lolol, 10)
  outLoud(laugh, lolID, lololID)
})

$.when('click', '[data-sidebar]', async (event) => {
  const { sidebar } = $.learn()
  $.teach({ sidebar: !sidebar })
})

$.when('click', '[data-avatar]', async (event) => {
  const { avatar } = $.learn()
  $.teach({ avatar: !avatar })
})


function getSession() {
  return state['ls/braid'] || {}
}

function clearSession() {
  state['ls/braid'] = {}
}

function setSession({ sessionId }) {
  state['ls/braid'] = {
    sessionId,
  }
}

$.when('submit', '.quick-auth', async (event) => {
  event.preventDefault()

  const companyEmployeeId = event.target.companyEmployeeId.value
  const companyName = event.target.companyName.value
  const password = event.target.password.value

  setSession({ companyEmployeeId, companyName, sessionId: 'foobar' })
})

function noop(){}

$.when('click', '[data-disconnect]', async () => {
  clearSession()
})

function outLoud(nextLaugh, lolID, lololID) {
  const key = currentWorkingDirectory + nextLaugh
  $.teach({ laugh: nextLaugh, saga: key, lolID, lololID })
}

$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & .quick-auth {
    background: rgba(0,0,0,.85);
    border-radius: 1rem;
    overflow: hidden;
  }

  & .quick-auth label {
    color: rgba(255,255,255,.65);
    padding: 0 1rem;
    text-transform: uppercase;
    font-size: .85rem;
    font-weight: 800;
  }

  & .control-toggle {
    position: absolute;
    left: 0;
    top: 1rem;
    z-index: 10;
  }

  & .control {
    display: grid;
    grid-template-columns: 1fr;
  }

  & .control.sidebar {
    grid-template-columns: 320px auto;
  }

  & .control-tab-list {
    display: none;
  }
  & .sidebar .control-tab-list {
    gap: .5rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding: 5rem 1rem 1rem;
    overflow: auto;
    background: rgba(255,255,255,.65);
    position: relative;
    z-index: 3;
    overflow-x: hidden;
  }
  & .multiplayer.control-tab-list {
    overflow: hidden;
  }
  & .control-tab {
    display: block;
    border: 0;
    border-radius: 1rem;
    line-height: 1;
    width: 4rem;
    color: white;
    display: block;
    width: 100%;
    text-align: left;
    padding: 1rem;
    color: dodgerblue;
    background: rgba(255,255,255,.85);
    transition: background 200ms ease-in-out;
    flex: none;
  }

  & .control-tab.-active,
  & .control-tab:hover,
  & .control-tab:focus {
    background: dodgerblue;
    color: white;
  }

  & .control-toggle .control-tab {
    display: block;
    border: 0;
    line-height: 1;
    width: 4rem;
    color: white;
    display: block;
    width: 100%;
    text-align: left;
    padding: .5rem;
    color: white;
    font-size: 1rem;
    border-radius: 0 1rem 1rem 0;
    background-image: linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.5));
    background-color: rgba(0,0,0,.5);
    transition: background 200ms ease-in-out;
    flex: none;
  }

  & .control-toggle .control-tab:hover,
  & .control-toggle .control-tab:focus {
    background-color: rgba(0,0,0,.25);
    color: white;
  }


  & .control-view {
    overflow: auto;
    position: relative;
    z-index: 2;
  }

  & .control-avatar {
    overflow: auto;
    position: absolute;
    z-index: 2;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    max-width: 100%;
    width: 320px;
    pointer-events: none;
  }

  & .control-avatar.show {

  }

  & data-tooltip,
  & xml-html,
  & data-tooltip .control {
    height: 100%;
  }
  & plan98-filesystem,
  & code-module {
    color: black;
  }

  & .heading-label {
    margin-top: 2rem;
    color: rgba(0,0,0,.5);
    text-align: right;
    font-weight: 600;
  }

  & hr {
    border-color: rgba(0,0,0,.05);
  }

  & poker-face {
    display: block;
    height: 280px;
  }

  & img + .heading-label {
    margin-top: 0;
  }

  & [data-sidebar] {
    font-size: 1.5rem;
    font-weight: 800;
    background: rgba(0,0,0,.5);
    border: none;
    border-radius: 0 1rem 1rem 0;
    padding: .5rem 1rem .5rem 2rem;
    color: rgba(255,255,255,.5);
    transition: background 200ms ease-in-out;
  }

  & [data-sidebar]:focus,
  & [data-sidebar]:hover {
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
  }

  & iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  & .control-avatar {
  }

  & .control-avatar .auth-button {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
    background-color: lime;
    color: white;
    display: block;
    border: 0;
    border-radius: 0 0 1rem 1rem;
    line-height: 1;
    width: 4rem;
    width: 100%;
    text-align: left;
    padding: 1rem;
    transition: all 200ms ease-in-out;
    flex: none;
  }

  & .control-avatar [data-disconnect] {
    background-color: orange;
  }


  & .control-avatar button:hover,
  & .control-avatar button:focus {
    background-color: rebeccapurple;
    color: white;
  }

  & .player {
  }

  & .control-avatar .console {
    background: rgba(128,128,128,.5);
    padding-top: 3rem;
  }

  & .control-avatar input {
    border: none;
    background: transparent;
    color: rgba(255,255,255,.85);
    padding: .5rem 1rem;
    margin-bottom: .5rem;
    max-width: 100%;
  }

  & .control-avatar .companyName {
    padding: .5rem 1rem;
    margin-bottom: .5rem;
  }
  & .control-avatar .companyEmployeeId {
    padding: .5rem 1rem;
    margin-bottom: .5rem;
  }


  & .control-avatar [data-avatar] {
    max-width: 64px;
    border-radius: 100%;
    aspect-ratio: 1;
    position: absolute;
    top: .5rem;
    right: .5rem;
    border: 3px solid var(--wheel-0-6, dodgerblue);
    z-index: 10;
    pointer-events: all;
  }

  & .tongue {
    background: linear-gradient(45deg, rgba(255,255,255,.75), rgba(255,255,255,.5)), var(--wheel-0-6);
    height: 100%;
    color: rgba(255,255,255,.85);
    opacity: 0;
    transition: opacity 200ms ease-in-out;
    overflow: hidden;
    width: 100%;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding: 1rem;
  }

  & .multiplayer .tongue {
    opacity: 1;
    pointer-events: all;
  }

  & .password {
    background: black;
  }

`)

