# tilt.js
a small and **simple** javascript library for building user interfaces. Highly depends on [htm](https://github.com/developit/htm) and heavily inspired by `useState` from the [React Hooks API](https://reactjs.org/docs/hooks-intro.html).

## Example
A counter
```js
const { useState, html, render } = tilt;

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
Run the command `$ npm run example` while in the root directory. It will serve the files on `localhost:3000` using Express.js (use `npm i` to install the dependencies first)


## Using it
add [tilt.min.js](/dist/tilt.min.js) to your html file, this will create a global `tilt` variable in `window`:
```html
<script src="tilt.min.js"></script>
```
You can use destructuring to get the 3 functions from `tilt`
```js
const { useState, html, render } = tilt;
```
