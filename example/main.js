import { useState, html, render } from '/src/tilt.js'

function Counter (props) {
  const [count, setCount] = useState(0)
  
  return html`
    <div class=counter>
      <h2>${props.title}</h2>
      <button onclick=${e => setCount(count + 1)}>➕</button>
      <button onclick=${e => {
        console.log('!')
        setCount(count - 1)
      }}>➖</button>

      <p>${count}</p>
    </div>
  `
}

function App () {
  const [title, setTitle] = useState('Hello, world!')

  return html`
    <div id=app>
      <input oninput=${e => setTitle(e.target.value)} value=${title} >
      <${Counter} title=${title} />
    </div>
  `
}

const v = render(html`<${App} />`, document.body)
console.log(v)