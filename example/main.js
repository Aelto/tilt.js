import { useState, html, render } from '/src/tilt.js'

function Counter (props) {
  const [count, setCount] = useState(0)
  
  return html`
    <div class=counter>
      <h2>${props.title}</h2>
      <button onclick=${e => setCount(count.value + 1)}>➕</button>
      <button onclick=${e => setCount(count.value - 1)}>➖</button>

      <p>${count}</p>
      <p>${count}</p>
    </div>
  `
}

function App () {
  const [title, setTitle] = useState('Hello, world!')

  return html`
    <div id=app>
      <input oninput=${e => setTitle(e.target.value)} value=${title.value} >
      <${Counter} title=${title} />
    </div>
  `
}

document.body.appendChild(render(html`<${App} />`))