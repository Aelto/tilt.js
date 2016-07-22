{
    'use strict';
    const tilt = {}
    tilt.storedFilters = {}
    tilt.storedEvents = {}
    tilt.filter = ( name, func ) => {
        if ( !name ) throw new Error('a name to the tilt event must be provided, name: ' + name)
        tilt.storedFilters[name] = func
        return tilt
    }
    tilt.on = ( name, func ) => {
        tilt.storedEvents[name] = {
            nodes: [],
            func
        }
        return tilt
    }
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
    tilt.handle = ( selector, obj ) => {
        const node = document.querySelector( selector )
        return node.nodeName === 'TEMPLATE' ? tilt.template( selector, obj ) : parseDomElement( node, obj )
    }
    tilt.container = class Container {
        constructor( selector ) {
            if ( !selector )
                throw new Error('requires a node element or a css selector to create a container, selector: ' + selector)
            this.dom = typeof selector === typeof '' ? document.querySelector( selector ) : selector
            this.children = []
            if ( this.dom.getAttribute('tilt') )
                this.dom.getAttribute('tilt').split(' ').forEach( name => this.addTilt(name) )
            this.nodes = {}
            this._templates = {
            }
            this.oldState = {}
            this.parent = null
        }
        render( state ) {
            const keys = Object.keys( state )
            keys.forEach( key => {
                if ( this.oldState[key] && this.oldState[key] === state[key] )
                    return
                if ( this._templates[key] )
                    for ( let child of this._templates[key] )
                        child.renderSpecific( state[key], this.oldState[key], key )
            })
            Object.keys( this.oldState ).forEach( key => delete this.oldState[key] )
            keys.forEach( key => this.oldState[key] = state[key] )
            return this
        }
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
        appendAt( node ) {
            node.appendChild( this.dom )
            return this
        }
        deconstruct() {
            if ( this.parent.constructor === tilt.container )
                this.parent.removeChild( this )
            this.dom.parentElement.removeChild( this.dom )
            return this
        }
        addTilt( name ) {
            if ( !tilt.storedEvents[name] )
                throw new Error(`tilt with name "${name}" is undefined`)
            tilt.storedEvents[name].nodes.push( this )
            return this
        }
        triggers( name ) {
            tilt.triggers( name, this )
            return this
        }
        on( name, func ) {
            this.dom.addEventListener( name, func )
            return this
        }
    }
    tilt.tag = class Tag {
        constructor( selector, templatesContainer ) {
            if ( !selector )
                throw new Error('requires a node element or a css selector to create a tilt.tag, selector: ' + selector)
            this.dom = typeof selector === typeof ''
            ? document.querySelector( selector )
            : selector
            this.template = ''
            this.templates = []
            this.oldState = ''
            this.filters = this.dom.getAttribute('t-filter')
            ? this.dom.getAttribute('t-filter').split(' ')
            : []
            if ( this.dom.getAttribute('tilt') )
                this.dom.getAttribute('tilt').split(' ').forEach( name => this.addTilt(name) )
            if ( this.dom.innerHTML.indexOf( '{{' ) >= 0 && this.dom.innerHTML.indexOf( '}}' ) >= 0 ) {
                const parsedString = this.dom.innerHTML
                parsedString.split('{{ ').forEach( tpl => {
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
        appendAt( node ) {
            node.appendChild( this.dom )
            return this
        }
        setParent( parent ) {
            this.parent = parent
            return this
        }
        deconstruct() {
            if ( this.parent.constructor === tilt.container )
                this.parent.removeChild( this )
            this.dom.parentElement.removeChild( this.dom )
            return this
        }
        addTilt( name ) {
            if ( !tilt.storedEvents[name] )
                throw new Error(`tilt with name "${name}" is undefined`)
            tilt.storedEvents[name].nodes.push( this )
            return this
        }
        triggers( name ) {
            tilt.triggers( name, this )
            return this
        }
        on( name, func ) {
            this.dom.addEventListener( name, func )
            return this
        }
    }
    const parseDomElement = ( el, obj = {}, templates = {} ) => {
        const nodesTemplates = {}
        let tiltElement
        const children = []
        for (let child of el.children)
            if ( child.nodeName !== 'TEMPLATE' ) children.push( child )
        if ( children.length || el.getAttribute('t-type') === 'container' ) {
            tiltElement = new tilt.container( el )
            for (let child of children)
                tiltElement.addChild( parseDomElement(child, obj, templates) )
        } else {
            tiltElement = new tilt.tag( el, templates )
            tiltElement.template = el.innerHTML
        }
        if ( el.getAttribute('var') ) obj[ el.getAttribute('var') ] = tiltElement
        tiltElement.nodes = obj
        tiltElement._templates = templates
        return tiltElement
    }
    window.tilt = tilt
}
