import tag from '@braid/tag'

const sagaDirectory = '/sagas/'

const lolol = [
  {
    label: 'Welcome',
    lol: [
      {
        label: 'Start',
        laugh: 'start.saga'
      }
    ]
  },
  {
    label: 'Office',
    lol: [
      {
        label: 'Script',
        laugh: 'script.saga'
      },
      {
        label: 'Notes',
        laugh: 'notes.saga'
      },
      {
        label: 'Boards',
        laugh: 'boards.saga'
      },
      {
        label: 'Browser',
        laugh: 'browser.saga'
      },
      {
        label: 'Maps',
        laugh: 'maps.saga'
      },

    ]
  },
  {
    label: 'Sports',
    lol: [
      {
        label: 'Football',
        laugh: 'football.saga'
      },
      {
        label: 'Baseball',
        laugh: 'baseball.saga'
      },
    ]
  },
  {
    label: 'Toys',
    lol: [
      {
        label: 'Minesweeper',
        laugh: 'mine-sweeper.saga'
      },
      {
        label: 'Paint App',
        laugh: 'paint.saga'
      },
      {
        label: 'Free Cell',
        laugh: 'free-cell.saga'
      },
      {
        label: 'F-DOS',
        laugh: 'fdos.saga'
      },
      {
        label: 'Sonic A.I.R.',
        laugh: 'sonic.saga'
      },
      {
        label: 'Mind Chess',
        laugh: 'mind-chess.saga'
      },

    ]
  },
  {
    label: 'Chats',
    lol: [
      {
        label: 'General',
        laugh: 'general.saga'
      },
      {
        label: 'Random',
        laugh: 'random.saga'
      },
    ]
  },
  {
    label: 'Insights',
    lol: [
      {
        label: 'Inbound',
        laugh: 'inbound.saga'
      },
      {
        label: 'Outbound',
        laugh: 'outbound.saga'
      },
    ]
  },
  {
    label: 'Hard Mode',
    lol: [
      {
        label: 'Code',
        laugh: 'code.saga'
      },
    ]
  },
]
const { laugh } = lolol[0].lol[0]
let lastLaugh = laugh
let lastSidebar = false

const $ = tag('parental-controls', {
  content: '...',
  laugh,
  sidebar: false,
  lololID: 0,
  lolID: 0
})

outLoud(laugh, 0, 0)

$.draw((target) => {
  const { sidebar, laugh, saga, lolID, lololID } = $.learn()
  target.beforeUpdate = scrollSave
  target.afterUpdate = scrollSidebar

  if(laugh !== lastLaugh && target.querySelector('iframe')) {
    lastLaugh = laugh
    target.querySelector('iframe').src = saga
    target.querySelector('.-active').classList.remove('-active')
    target.querySelector(`.control-tab[data-lol="${lolID}"][data-lolol="${lololID}"]`).classList.add('-active')
    return
  }

  if(sidebar !== lastSidebar && target.querySelector('[data-sidebar]')) {
    target.querySelector('[data-sidebar]').innerText = sidebar ? 'Menu.' : 'Menu?'
    sidebar
    ? target.querySelector('data-tooltip').classList.add('sidebar')
    : target.querySelector('data-tooltip').classList.remove('sidebar')
    return
  }

  return `
    <data-tooltip class="control ${sidebar ? 'sidebar': ''}" aria-live="assertive">
      <div class="control-toggle">
        <button data-sidebar>
          ${sidebar ? 'Menu.' : 'Menu?'}
        </button>
      </div>
      <div class="control-tab-list">
        <img src="/cdn/thelanding.page/giggle.svg" style="max-height: 8rem; margin: auto; display: block;" alt="" />
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
  lastSidebar = sidebar
  $.teach({ sidebar: !sidebar })
})

function outLoud(nextLaugh, lolID, lololID) {
  const key = sagaDirectory + nextLaugh
  $.teach({ laugh: nextLaugh, saga: key, lolID, lololID })
}

$.style(`
  & {
    display: block;
    height: 100%;
    background: linear-gradient(165deg, rgba(255,255,255,.85) 60%, dodgerblue);
    overflow: hidden;
    position: relative;
  }

  & .control-toggle {
    position: absolute;
    left: 0;
    top: 2rem;
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
    padding: 1rem 1rem 1rem;
    overflow: auto;
    background: rgba(255,255,255,.65);
    position: relative;
    z-index: 3;
    overflow-x: hidden;
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

  & .control-toggle button {
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

  & .control-toggle button:hover,
  & .control-toggle button:focus {
    background-color: rgba(0,0,0,.25);
    color: white;
  }


  & .control-view {
    overflow: auto;
    position: relative;
    z-index: 2;
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

  & iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
`)

