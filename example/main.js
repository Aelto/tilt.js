import { useState, h, render } from '/src/tilt.js'
import htm from '/htm.js'

const html = htm.bind(h)

function App () {
  const [count, setCount] = useState(0)

  return html`
    <div id=app>
      <button onclick=${e => setCount(count.value + 1)}>➕</button>
      <button onclick=${e => setCount(count.value - 1)}>➖</button>

      <p>${count}</p>
      <p>${count}</p>
    </div>
  `
}

document.body.appendChild(render(App()))