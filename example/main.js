import { useState, html, render } from '/src/tilt.js'

function Counter (props) {
  const [count, setCount] = useState(0)
  
  return html`
    <div class=counter>
      <h2>${props.title}</h2>
      <button onclick=${e => setCount(count + 1)}>➕</button>
      <button onclick=${e => setCount(count - 1)}>➖</button>

      <p>${count}</p>
    </div>
  `
}

function App () {
  const [title, setTitle] = useState('Hello, world!')
  const [counters, setCounters] = useState([])
  
  const addCounter = () => {
    setCounters([...counters, html`<${Counter} />`])
  };

  const removeCounter = () => {
    setCounters(counters.slice(0, counters.length - 1));
  };

  return html`
    <div id=app>
      <input oninput=${e => setTitle(e.target.value)} value=${title} >
      <button onclick=${e => addCounter()}>➕</button>
      <span>${counters.length}</span>
      <button onclick=${e => removeCounter()}>➖</button>

      <div>
        ${counters}
      </div>
    </div>
  `
}

const v = render(html`<${App} />`, document.body)