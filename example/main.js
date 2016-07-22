
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
