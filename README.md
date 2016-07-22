# tilt.js
a small and **simple** javascript library for building user interfaces

<<<<<<< HEAD
## Example
index.html
```html

<div class='test'>

	<div class="container" var='container' t-type='container'>

		<template id='todo' tilt='deleteTodo'>{{ content }}</template>

	</div>

	<input type="text" var='input'>
	<button var='button'>add °{{ n }} </button>

</div>

```

main.js
```javascript

const state = {n: 1}

const virtual = tilt.handle('.test')


const updateDom = ( inc ) => {
    state.n += inc
    virtual.render(state)
}

virtual.nodes.button.dom.addEventListener('click', e => {

    if (virtual.nodes.input.dom.value === '') return

    const newTodo = tilt.handle('#todo')
                    .appendAt(virtual.nodes.container.dom)
                    .render({content: virtual.nodes.input.dom.value})
                    .on('click', e => newTodo.triggers('deleteTodo'))

    virtual.nodes.container.addChild( newTodo )

    virtual.nodes.input.dom.value = ''
    virtual.nodes.input.dom.focus()

    updateDom( 1 )

})

// the tilt event could have been replaced by a simple function here
// it's just to show how it works
tilt.on('deleteTodo', ( node, dom ) => {
    node.deconstruct()
    updateDom( -1 )
})

virtual.render(state)
```

## Documentation

### tilt.handle
*parameters:* `( string css_selector, object holder_object )`

It is the main function of tilt.js. It return a tilt.container object based on html nodes.

todo...
=======
## examples

### basics
simple html elements without events
```javascript
new tilt.container('p')
	.addChild(new tilt.tag('div.child child 1')
	.addChild(new tilt.tag('div.child child 2')
```
is the same as
```html
<p>
  <div class='child'>child 1</div>
  <div class='child'>child 2</div>
</p>
```

templates can also be used

index.html
```html
<template id='tpl'>
	<button var='button'>click me!</button>
	<div class='container'>
		<div>you clicked {{n}} times</div>
	</div>
</template>
```

script.js
```javascript
const obj = {}
tilt.template('#tpl', obj) // returns a new tilt.container

// you can now access to the <button> element
obj.button // to get the tilt object
obj.button.dom // to get the dom element
```

basics #2. 2 inputs type button, with real events and tilt event linked to them
```javascript
const state = {n: 0, y: 'click me...'}
let $button, $div
const $parent = new tilt.container('div')
	.addChild($button = new tilt.tag('button {{y}}'))
	.addChild($div = new tilt.tag('div you clicked {{n}} times'))

$parent.appendAt(document.body)
	.render(state)

$button.addTilt('width', obj => obj.dom.style.width = 100 + state.n * 5 + 'px')
$div.addTilt('width', true) // no need to write the function again

$button.on('click', () => {
	state.n++
	tilt.event('width') // triggers the 'width' tilt event on both dom element $div and $button

	if (state.n > 2) state.y = 'click again!'
	$parent.render(state)
})
```
>>>>>>> origin/master
