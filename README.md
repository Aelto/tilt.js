# tilt.js
a small and **simple** javascript library for building user interfaces. Highly depends on [htm](https://github.com/developit/htm)

## Example
A counter with an editable tilte:
```js
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
  const [list, setList] = useState([1, 2, 3])

  return html`
    <div id=app>
      <input oninput=${e => setTitle(e.target.value)} value=${title.value} >
      <${Counter} title=${title} />
      
      <!-- list rendering using `.map` -->
      ${list.map(i => html`<p>${i}</p>`)}
    </div>
  `
}

document.body.appendChild(render(html`<${App} />`))
```

### running the example server
go into the `/example` directory then run `node sever.js`. It will serve the files on `localhost:3000`


## Documentation
It almost works the same way react hooks work, except for one point: getting the hook's value outside of the markup is different. It is accessible through an attribute: `value`

an example when increasing a counter:
```jsx
// see: count.value + 1
<button onclick=${e => setCount(count.value + 1)}>➕</button>
```
