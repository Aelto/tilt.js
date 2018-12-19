import { useState, html, render } from '/src/tilt.js'

function Counter (props) {
  const [count, setCount] = useState(0);

  return html`
    <p class=counter>
      ${
        props.showTitle 
          ? html`<h2>${props.title}</h2>`
          : null
      } 
      <button onclick=${e => setCount(count + 1)}>➕</button>
      <span>${count}</span>
      <button onclick=${e => setCount(count - 1)}>➖</button>
    </p>
  `;
}

function App () {
  const [title, setTitle] = useState('');
  const [counters, setCounters] = useState([])
  const [showTitle, setShowTitle] = useState(true);
  
  const addCounter = () => {
    if (!title.length) {
      return;
    }

    setCounters([...counters, { title }]);
    setTitle("");
  };

  const removeCounter = () => {
    setCounters(counters.slice(0, counters.length - 1));
  };

  return html`
    <div id=app>
      <input oninput=${e => setTitle(e.target.value)} value=${title} >
      <button onclick=${e => addCounter()}>create</button>
      <span>${counters.length}</span>
      <button onclick=${e => removeCounter()}>remove last</button>
      <button onclick=${e => setShowTitle(!showTitle)}>toggle title</button>

      <div>
        ${counters.map(({ title }) => html`<${Counter} showTitle=${showTitle} title=${title} />`)}
      </div>
    </div>
  `;
}

const v = render(html`<${App} />`, document.body)