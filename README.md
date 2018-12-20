# tilt.js
a small and **simple** javascript library for building user interfaces. Highly depends on [htm](https://github.com/developit/htm) and heavily inspired by `useState` from the React Hooks API.

## Example
A counter
```js
import { useState, html, render } from '/src/tilt.js'

function Counter (props) {
  const [count, setCount] = useState(0);

  return html`
    <p class=counter>
      <button onclick=${e => setCount(count + 1)}>➕</button>
      <span>count: ${count}</span>
      <button onclick=${e => setCount(count - 1)}>➖</button>
    </p>
  `;
}

render(html`<${Counter} />`, document.body);
```

### running the example server
go into the `/example` directory then run `node sever.js`. It will serve the files on `localhost:3000`


## Using it
add `/dist/tilt.min.js` to your html file, this will create a global `tilt` variable in `window`:
```html
<script src="/dist/index.js"></script>
```
You can use destructuring to get the 3 functions from `tilt`
```js
const { useState, html, render } = tilt;
```