
class State {
  constructor (v) {
    this.value = v
  }
}

export function useState (value) {
  let state = new State(value)

  return [state, (v) => state.value = v]
}

export function render (vdom, parent = null) {
  if (typeof vdom === 'string') {
    return vdom
  }

  if (vdom instanceof State) {
    return vdom.value
  }

  const { nodeName, key, children, attributes } = vdom

  const node = document.createElement(nodeName)

  const childrenNodes = []
  if (children) {
    for (const child of children) {
      const childNode = render(child)
  
      childrenNodes.push(childNode)
    }
  }

  if (attributes) {
    for (const attr of Object.keys(attributes)) {
      node.setAttribute(attr, attributes[attr])
    }
  }

  if (parent !== null) {
    for (const childNode of childrenNodes) {
      node.appendChild(childNode)  
    }

    parent.appendChild(node)
  }
  else {
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