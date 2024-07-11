import tag from '@braid/tag'

const $ = tag('landing-page')

$.draw(() => {

  return `
    <div class="content">
      <div class="hero">
        <img />
        <h2>hero title</h2>
      </div>
      <div class="featured">
        <div>
          <img />
          <h3>featured title</h3>
        </div>
        <div>
          <img />
          <h3>featured title</h3>
        </div>
        <div>
          <img />
          <h3>featured title</h3>
        </div>
      </div>

      <div class="top">
        <div>
          <img />
          <h4>top title</h4>
        </div>
        <div>
          <img />
          <h4>top title</h4>
        </div>
      </div>
      <div class="rest">
        <h5>Still Popular Enough</h5>
      </div>
    </div>
    <div class="sidebar">
      <h6>Play</h6>
      <h6>Code</h6>
    </div>
    <div class="third-rail">
      <h6>Blog Roll</h6>

      ...
      ...
      ...
    </div>
  `
})

$.style(`
  & {
    display: grid;
    grid-template-columns: 2fr 4fr 1fr;
    grid-template-areas: "sidebar content third";
  }

  & .sidebar {
    grid-area: sidebar;
  }

  & .third-rail {
    grid-area: third;
  }

  & .featured {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  & .top {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  & .content {
    grid-area: content;
  }


  @media (max-width: 1024px) {
    & {
      grid-template-areas:
        "content content"
        "sidebar third";
      grid-template-columns: 1fr 1fr;
    }

    & .top {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 767px) {
    & {
      display: block;
      grid-template-columns: 1fr
    }
  }
`)
