# tilt.js
a small and **simple** javascript library for building user interfaces

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
