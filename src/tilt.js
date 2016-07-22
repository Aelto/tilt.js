{
    'use strict';

    const tilt = {}

    /**
     * an object used to store events created during run-time with the tilt.filter() function
     * @memberof tilt
     */
    tilt.storedFilters = {}

    /**
     * an object used to store tilts created during tun-time with the tilt.on() function
     * @memberof tilt
     */
    tilt.storedEvents = {
        /* a tilt object looks like:
        {
            nodes: [], // it's a list of all nodes linked to the tilt
            func: ( node[i], node[i].dom, i, nodes ) => {} // the tilt is executed with specific parameters
        }
        */
    }

    /**
     * store a filter event
     * @memberof tilt
     * @return tilt
     * @arg {STRING} name, tilt filter's name
     * @arg {*} func, the value paired to the filter's name
     */
    tilt.filter = ( name, func ) => {

        if ( !name ) throw new Error('a name to the tilt event must be provided, name: ' + name)

        tilt.storedFilters[name] = func

        return tilt

    }

    /**
     * create (or overwrite) a tilt event
     * @memberof tilt
     * @return tilt
     * @arg {STRING0} name, tilt event's name
     * @arg {FUNCTION} func, the function paired to the tilt's name
     */
    tilt.on = ( name, func ) => {

        tilt.storedEvents[name] = {
            nodes: [],
            func
        }

        return tilt

    }

    /**
     * triggers the tilt event based on his name
     * !! fails silently if no tilt event was found !!
     * @memberof tilt
     * @return tilt
     * @arg {STRING} name, tilt event's name to trigger
     * @arg {OBJECT} el, can be a tilt.tag or a tilt.container that is supplied when we want to execute a tilt event only on a single node
     */
    tilt.triggers = ( name, el ) => {

        if ( tilt.storedEvents[name] ) {

            if ( el )
                return tilt.storedEvents[name].func( el, el.dom, 0, tilt.storedEvents[name].nodes )

            let node
            for (let i = 0; i < tilt.storedEvents[name].nodes.length; i++) {
                node = tilt.storedEvents[name].nodes[i]

                tilt.storedEvents[name].func( node, node.dom, i, tilt.storedEvents[name].nodes )

            }

        }

        return tilt

    }

    /**
     * Creates a new tilt.container and returns it based on a template
     * @memberof tilt
     * @return new tilt.container
     * @arg {STRING} selector, a CSS selector that will be used for a querySelector
     * @arg {OBJECT} obj, optional, and is used to store variables generated when reading the template
     * such as dom elements
     */
    tilt.template = ( selector, obj ) => {

        const template = document.querySelector(selector)
        const divContainer = document.createElement('div')

        const tplAttributes = template.outerHTML.replace('<template ', '')
        .split('>')[0]
        .split(' ').map( pair => ({
            key: pair.split('=')[0],
            value: pair.split('=')[1].split('"').join('')
        }))
        .filter( pair => pair.key !== 'id' )

        tplAttributes.forEach( attr => divContainer.setAttribute(attr.key, attr.value) )

        divContainer.innerHTML = template.innerHTML

        return parseDomElement( divContainer, obj )

    }

    /**
     * Creates a new tilt.container and returns it based on an already appended dom element
     * @memberof tilt
     * @return new tilt.container
     * @arg {STRING} selector, a CSS selector that will be used for a querySelector
     * @arg {OBJECT} obj, optional, and is used to store variables generated when reading the dom
     */
    tilt.handle = ( selector, obj ) => {

        const node = document.querySelector( selector )

        return node.nodeName === 'TEMPLATE' ? tilt.template( selector, obj ) : parseDomElement( node, obj )

    }

    /**
     * Represents a handle between a dom element and a javascript object.
     * It's used when the dom element contains multiples dom elements
     * @memberof tilt
     * @class Container
     *
     */
    tilt.container = class Container {
        constructor( selector ) {

            if ( !selector )
                throw new Error('requires a node element or a css selector to create a container, selector: ' + selector)

            /**
             * the dom element this handle is linked to
             */
            this.dom = typeof selector === typeof '' ? document.querySelector( selector ) : selector

            /**
             * the children this container has
             */
            this.children = []

            /**
             * check for any tilt event linked to this element
             */
            if ( this.dom.getAttribute('tilt') )
                this.dom.getAttribute('tilt').split(' ').forEach( name => this.addTilt(name) )


            /**
             * store nodes contained inside this
             */
            this.nodes = {}

            /**
             * it will contains references to all templates
             */
            this._templates = {
                // key: [ tilt.tag, ... ]
            }

            /**
             * a copy of the previous state rendered
             */
            this.oldState = {}

            /**
             * a reference to the parent, or null
             */
            this.parent = null

        }

        /**
         * This function will recursively call all .render() methods for each element it contains
         * @memberof tilt
         * @class Container
         * @return this
         * @arg {OBJECT} state, represents the "new" state of the dom
         */
        render( state ) {


            const keys = Object.keys( state )

            // compare the new state and the old state
            keys.forEach( key => {

                // the old rendered state already contained the key with the same value
                if ( this.oldState[key] && this.oldState[key] === state[key] )
                    return


                // the old rendered state did not contain the key
                // or the old rendered state contained the key but the value was different
                if ( this._templates[key] )
                    for ( let child of this._templates[key] )
                        child.renderSpecific( state[key], this.oldState[key], key )

            })

            // clear the old state
            Object.keys( this.oldState ).forEach( key => delete this.oldState[key] )

            keys.forEach( key => this.oldState[key] = state[key] )

            return this

        }

        /**
         * Add a child to the container's list
         * @memberof
         * @class Container
         * @return this
         * @arg {tilt.tag || domNode || tilt.container} child, the tilt.tag / tilt.container / domNode to add the container
         */
        addChild( child ) {

            if ( !child )
                throw new Error('addChild requires atleast a domNode, child: ' + child)

            if ( child.constructor && child.constructor === tilt.tag || child.constructor === tilt.container )
                this.children.push( child.setParent( this ) )
            else
                this.children.push( tilt.parseDomElement(child).setParent( this ) )

            return this

        }

        removeChild( child ) {

            for (let i = 0; i < this.children.length; i++)
                if ( this.children[i] === child ) this.children.slice( i, 1 )

            child.setParent( null )

            return this

        }

        setParent( parent ) {

            this.parent = parent

            return this

        }

        /**
         *
         * @memberof tilt
         * @class Container
         * @return this
         * @arg {domNode} node, dom element this will be appended
         */
        appendAt( node ) {

            node.appendChild( this.dom )

            return this

        }

        /**
         * remove a node from the dom and from the virtual tree
         * @memberof tilt
         * @class Container
         * @return this
         */
        deconstruct() {

            if ( this.parent.constructor === tilt.container )
                this.parent.removeChild( this )

            this.dom.parentElement.removeChild( this.dom )

            return this

        }

        /**
         * add a tilt event to this object
         * @memberof tilt
         * @class Container
         * @return this
         * @arg {STRING} name, name of the tilt event
         */
        addTilt( name ) {

            if ( !tilt.storedEvents[name] )
                throw new Error(`tilt with name "${name}" is undefined`)

            tilt.storedEvents[name].nodes.push( this )

            return this

        }

        /**
         * triggers a specific tilt event only a this object
         * @memberof tilt
         * @class Container
         * @return this
         * @arg {STRING} name, name of the tilt event
         */
        triggers( name ) {

            tilt.triggers( name, this )

            return this

        }

        /**
         * add an event listener to the dom node
         * @memberof tilt
         * @class Container
         * @return this
         * @arg {STRING} name, name of the event ('click', 'keydown', ...)
         * @arg {FUNCTION} func, function called when the event is triggered
         */
        on( name, func ) {

            this.dom.addEventListener( name, func )

            return this

        }


    }

    /**
     * Represents a handle between a dom element and a javascript object.
     * It's used wheb the dom element contains a single dom element
     * @memberof tilt
     * @class Tag
     */
    tilt.tag = class Tag {
        constructor( selector, templatesContainer ) {

            if ( !selector )
                throw new Error('requires a node element or a css selector to create a tilt.tag, selector: ' + selector)


            /**
             * the dom element this handle is linked to
             */
            this.dom = typeof selector === typeof ''
            ? document.querySelector( selector )
            : selector

            /**
             * the template string that defines what will appear in the dom once parsed
             */
            this.template = ''

            /**
             * stores all templates key contained in this tag
             */
            this.templates = []

            /**
             * what the old state, once parsed, looked like
             * it's used when checking for changes to know if a dom update is needed
             */
            this.oldState = ''

            /**
             * a list of filters that will be applied to the parsedContent when rendering the element
             */
            this.filters = this.dom.getAttribute('t-filter')
            ? this.dom.getAttribute('t-filter').split(' ')
            : []

            /**
             * check for any tilt event linked to this element
             */
            if ( this.dom.getAttribute('tilt') )
                this.dom.getAttribute('tilt').split(' ').forEach( name => this.addTilt(name) )


            if ( this.dom.innerHTML.indexOf( '{{' ) >= 0 && this.dom.innerHTML.indexOf( '}}' ) >= 0 ) {

                const parsedString = this.dom.innerHTML

                parsedString.split('{{ ').forEach( tpl => {

                    // the template is not closed
                    if ( tpl.indexOf(' }}') < 0 ) return

                    tpl = tpl.split(' }}')[0]

                    this.templates.push( tpl )
                })

                this.template = this.dom.innerHTML

            }

            this.templates.forEach( tpl => {
                if ( !templatesContainer[tpl] )
                    templatesContainer[tpl] = [ this ]
                else
                    templatesContainer[tpl].push( this )
            } )


        }

        /**
         * This function checks if the new state is different from the old one,
         * if yes it will update the dom
         * @memberof tilt
         * @class Tag
         * @arg {OBJECT} state, represents the "new state of the dom"
         */
        render( state = {} ) {


            if ( !this.templates.length || this.template === '' ) return this

            let parsedContent = this.template

            for ( let i = 0; i < this.templates.length; i++ ) {

                const currentTpl = this.templates[i]

                if ( !state[ currentTpl ] ) continue

                parsedContent = parsedContent.split( `{{ ${currentTpl} }}` ).join( state[currentTpl] )

            }

            for (let filter of this.filters)
                parsedContent = tilt.storedFilters[filter]( self, parsedContent )

            if ( parsedContent !== this.oldState && parsedContent !== this.template ) {

                this.oldState = parsedContent

                this.dom.innerHTML = parsedContent

            }

            return this

        }

        renderSpecific( newState, oldState, key ) {

            const parsedContent = this.dom.innerHTML
                .replace( oldState, newState )
                .replace( `{{ ${key} }}`, newState )

            for (let filter of this.filters)
                parsedContent = tilt.storedFilters[filter]( self, parsedContent )

            if ( parsedContent !== this.oldState && parsedContent !== this.template ) {

              this.oldState = parsedContent

              this.dom.innerHTML = parsedContent

            }

        }

        /**
         * append the html node to the supplied dom element
         * @memberof
         * @class Tag
         * @return this
         * @arg {domNode} node, dom element this will be appended
         */
        appendAt( node ) {

            node.appendChild( this.dom )

            return this

        }

        setParent( parent ) {

            this.parent = parent

            return this

        }

        /**
         * remove a node from the dom and from the virtual tree
         * @memberof tilt
         * @class Container
         * @return this
         */
        deconstruct() {

            if ( this.parent.constructor === tilt.container )
                this.parent.removeChild( this )

            this.dom.parentElement.removeChild( this.dom )

            return this

        }

        /**
         * add a tilt event to this object
         * @memberof tilt
         * @class Tag
         * @return this
         * @arg {STRING} name, name of the tilt event
         */
        addTilt( name ) {

            if ( !tilt.storedEvents[name] )
                throw new Error(`tilt with name "${name}" is undefined`)

            tilt.storedEvents[name].nodes.push( this )

            return this

        }

        /**
         * triggers a specific tilt event only a this object
         * @memberof tilt
         * @class Tag
         * @return this
         * @arg {STRING} name, name of the tilt event
         */
        triggers( name ) {

            tilt.triggers( name, this )

            return this

        }

        /**
         * add an event listener to the dom node
         * @memberof tilt
         * @class Tag
         * @return this
         * @arg {STRING} name, name of the event ('click', 'keydown', ...)
         * @arg {FUNCTION} func, function called when the event is triggered
         */
        on( name, func ) {

            this.dom.addEventListener( name, func )

            return this

        }
    }

    /**
     * recursive function which generates tilt.containers and tilt.tags based on the dom node received
     * @private
     * @arg {NODE} el, dom element
     * @arg {OBJECT} obj, optional, and is used to store variables generated when reading the dom
     */
    const parseDomElement = ( el, obj = {}, templates = {} ) => {

        const nodesTemplates = {}

        let tiltElement

        const children = []
        for (let child of el.children)
            if ( child.nodeName !== 'TEMPLATE' ) children.push( child )

        // the node has multiple children nodes
        if ( children.length || el.getAttribute('t-type') === 'container' ) {

            tiltElement = new tilt.container( el )

            for (let child of children)
                tiltElement.addChild( parseDomElement(child, obj, templates) )

        // the node has no children, only text or is empty
        } else {

            tiltElement = new tilt.tag( el, templates )

            tiltElement.template = el.innerHTML

        }

        if ( el.getAttribute('var') ) obj[ el.getAttribute('var') ] = tiltElement

        // update the reference for the contaied nodes
        // TODO use object.keys to copy the object instead
        tiltElement.nodes = obj

        // list all templates contained in the container
        tiltElement._templates = templates

        return tiltElement

    }

    window.tilt = tilt

}
