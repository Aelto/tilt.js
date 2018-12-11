class State {
  constructor (v) {
    this.value = v

    this.onChanges = []
  }

  setValue (v) {
    this.value = v

    for (const onChange of this.onChanges) {
      onChange()
    }
  }
}

export function useState (value) {
  let state = new State(value)

  return [state, state.setValue.bind(state)]
}

export function render(hNode) {
  if (typeof hNode === 'string' || typeof hNode === 'number') {
    if (String(hNode).trim().length) {
      return document.createTextNode(hNode)
    }
    else {
      return undefined
    }
  }
  else if (hNode instanceof State) {
    let node = render(hNode.value)

    hNode.onChanges.push(() => {
      // when there are changes to the `State`
      // get the parentElement and use .replaceChild(new, old) to get the new value
      const newNode = render(hNode.value)
      console.log(newNode)

      node.parentElement.replaceChild(newNode, node)

      node = newNode
    })

    return node
  }
  else {
    // `h` object
    const { nodeName, key, children = [], attributes = {} } = hNode

    const node = document.createElement(nodeName)
    const childrenNodes = []
    for (const child of children) {
      const childNode = render(child)

      if (childNode) {
        node.appendChild(childNode)
      }
    }

    for (const attr in attributes) {
      const value = attributes[attr]

      if (typeof value === 'function') {
        console.log(value)
        node.addEventListener(attr.startsWith('on')
          ? attr.replace('on', '')
          : attr, value)
      }
      else {
        node.setAttribute(attr, value)
      }
    }

    return node
  }
}


export function h(name, attributes) {
  var rest = []
  var children = []
  var length = arguments.length

  while (length-- > 2) rest.push(arguments[length])

  while (rest.length) {
    var node = rest.pop()
    if (node && node.pop) {
      for (length = node.length; length--; ) {
        rest.push(node[length])
      }
    } else if (node != null && node !== true && node !== false) {
      children.push(node)
    }
  }

  return typeof name === "function"
    ? name(attributes || {}, children)
    : {
        nodeName: name,
        attributes: attributes || {},
        children: children,
        key: attributes && attributes.key
      }
}