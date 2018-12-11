import { useState, h, render } from '/src/tilt.js'
import htm from '/htm.js'

const html = htm.bind(h)
const world = 'world'
console.log(html`<div>hello ${world}</div>`)

function App () {
  const [count, setCount] = useState(0)

  return html`
    <div id=app>
      <button>➕</button>
      <button>➖</button>

      <p>${count}</p>
    </div>
  `
}

render(App(), document.body)