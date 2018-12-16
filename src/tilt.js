
let root;
let currentLayer;

export function useState (defaultValue) {
  const layer = currentLayer;
  const stateUniqueToken = layer.id;

  if (!layer.contexts.has(stateUniqueToken)) {
    layer.contexts.set(stateUniqueToken, {
      value: defaultValue
    });
  }

  const currentContext = layer.contexts.get(stateUniqueToken);
  const setter = updatedValue => {
    currentContext.value = updatedValue;
    currentLayer = layer;
    const result = layer.component.fn(layer.component.attributes);
    const newLayer = render(result)
    applyChanges(layer, newLayer);
  };

  return [currentContext.value, setter];
};

export function render (hnode, rootNode) {
  const layer = createLayer();
  
  if (!root) {
    root = layer;
  }

  if (typeof hnode === 'string' || typeof hnode === 'number') {
    layer.hnode = hnode;
  }

  if (hnode.$$typeof === Symbol.for('hnode')) {
    layer.hnode = hnode;

    layer.hnode.children = layer.hnode.children
      .map(child => render(child));
  }

  if (hnode.$$typeof === Symbol.for('component')) {
    layer.component = hnode;

    currentLayer = layer;
    const result = layer.component.fn(layer.component.attributes);
    layer.hnode = result;

    layer.hnode.children = layer.hnode.children
      .map(child => render(child));
  }

  if (rootNode) {
    rootNode.appendChild(buildLayer(layer));
  }

  return layer;
};

function createLayer () {
  const layer = {
    contexts: new Map(),
    id: Symbol('layer'),
    events: new Map()
  };

  return layer;
}




function buildLayer (layer) {
  const { hnode } = layer;
  const { nodeName, attributes, children } = hnode;

  if (typeof hnode === 'string' || typeof hnode === 'number') {
    const node = document.createTextNode(hnode);
    layer.node = node;
    
    return node;
  }

  const node = document.createElement(nodeName);

  for (const attrName in attributes) {
    const attrValue = attributes[attrName];

    if (typeof attrValue === 'function') {
      const event = attrName.startsWith('on')
        ? attrName.replace('on', '')
        : attrName;

      node[attrName] = e => {
        if (layer.events[e.type]) {
          for (const evt of layer.events[e.type]) {
            evt(e);
          }
        }
      };

      if (!layer.events[event]) {
        layer.events[event] = [];
      }

      layer.events[event].push(attrValue);
    }
    else {
      node.setAttribute(attrName, attrValue);
    }
  }

  for (const childLayer of children) {
    if (childLayer.hnode.trim && !childLayer.hnode.trim().length) {
      continue;
    }

    node.appendChild(buildLayer(childLayer));
  }

  layer.node = node;

  return node;
}



function applyChanges(previousLayer, nextLayer) {
  const root = previousLayer.node;

  if (typeof nextLayer.hnode === 'string' || typeof nextLayer.hnode === 'number') {
    if (nextLayer.hnode.trim && !nextLayer.hnode.trim().length) {
      return;
    }

    const node = buildLayer(nextLayer);
    previousLayer.node.parentElement.replaceChild(node, previousLayer.node);
    previousLayer.node = node;

    return;
  }

  if (previousLayer.hnode.nodeName === nextLayer.hnode.nodeName) {
    previousLayer.events = {};

    for (const attrName in previousLayer.hnode.attributes) {
      const attrValue = previousLayer.hnode.attributes[attrName];
      const nextLayerAttrValue = nextLayer.hnode.attributes[attrName];

      if (!nextLayerAttrValue) {
        // this attribute was not found in the newLayer
        // we remove it from the node
        if (typeof attrValue === 'function') {
        
        }
        else {
          root.removeAttribute(attrName);
        }
      }
      else if (attrValue !== nextLayerAttrValue) {
        // attribute found on both layers, edit values
        if (typeof attrValue === 'function') {
          const event = attrName.startsWith('on')
            ? attrName.replace('on', '')
            : attrName;

          if (!previousLayer.events[event]) {
            previousLayer.events[event] = [];
          }

          previousLayer.events[event].push(nextLayerAttrValue);
        }
        else {
          root.setAttribute(attrName, nextLayerAttrValue);
        }
      }
    }

    for (let i = 0; i < previousLayer.hnode.children.length; i++) {
      const previousChildLayer = previousLayer.hnode.children[i];
      const nextChildLayer = nextLayer.hnode.children[i];

      if (previousChildLayer && nextChildLayer) {
        applyChanges(previousChildLayer, nextChildLayer);
      }

      if (!previousChildLayer && nextChildLayer) {
        const newNode = buildLayer(nextLayer);

        previousChildLayer.hnode.push(nextLayer);
        root.appendChild(newNode);
      }

      if (previousChildLayer && !nextChildLayer) {
        const index = previous.hnode.children.indexOf(previousChildLayer);

        previous.hnode.children.splice(index, 1);
      }
    }
  }
  else {
    const newNode = buildLayer(nextLayer)
  }
}






function setUpdates(tree, next) {

}

function diff(next, previous) {
  if (typeof next.hnode === 'string' || typeof next.hnode === 'number') {
    return next.hnode === previous
      ? null
      : next.hnode;
  }

  nextHnode = next.hnode;
  previousHnode = previous.hnode || {
    attributes: {},
    children: [],
    nodeName: null
  };

  const changes = {
    attributes: {},
    removedAttributes: [],
    children: [],
    nodeName: null
  };

  if (next.nodeName !== previous.nodeName) {
    changes.nodeName = next.nodeName; // usually means a full re-render
    changes.attributes = next.attributes
    changes.children = next.children
  }

  for (const key in next.attributes) {
    if (next.attributes[key] !== previous.attributes[key]) {
      changes.attributes[key] = next.attributes[key];
    }
  }

  for (const key in previous.attributes) {
    if (!next.attributes[key]) {
      changes.removedAttributes.push(key);
    }
  }

  for (let i = 0; i < next.children.length; i++) {
    const nextCurrent = next.children[i];
    const previousCurrent = previous.children[i] || {
      attributes: {},
      children: [],
      nodeName: null
    };

    changes.children.push(diff(nextCurrent, previousCurrent));
  }

  return changes
}










function h(name, attributes) {
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

  if (typeof name === "function") {
    return {
    fn: name,
    attributes,
    children,
    $$typeof: Symbol.for('component')
    }
  }

  return {
    nodeName: name,
    attributes: attributes || {},
    children: children,
    key: attributes && attributes.key,
    $$typeof: Symbol.for('hnode')
  }
}

//#region html
var t = {},
  e = document.createElement("template"),
  r = /(\$_h\[\d+\])/g;

function n(t, e) {
  var n = t.match(r),
    a = JSON.stringify(t); if (null != n) {
      if (n[0] === t) return t; a = a.replace(r, '"' + e + "$1" + e + '"').replace(/"[+,]"/g, ""), "," == e && (a = "[" + a + "]");
    } return a;
}

function htm(r) {
  return (t[r] || (t[r] = function (t) {
    for (var r = t[0], a = 1; a < t.length;) r += "$_h[" + a + "]" + t[a++]; return e.innerHTML = r.replace(/<(?:(\/)\/|(\/?)(\$_h\[\d+\]))/g, "<$1$2c c@=$3").replace(/<([\w:-]+)(?:\s[^<>]*?)?(\/?)>/g, function (t, e, r) {
      return t.replace(/(?:'.*?'|".*?"|([A-Z]))/g, function (t, e) {
        return e ? ":::" + e : t;
      }) + (r ? "</" + e + ">" : "");
    }).trim(), Function("h", "$_h", "return " + function t(e) {
      if (1 != e.nodeType) return 3 == e.nodeType && e.data ? n(e.data, ",") : "null"; for (var r = "", a = n(e.localName, r), i = "", u = ",({", c = 0; c < e.attributes.length; c++) {
        var l = e.attributes[c].name,
          o = e.attributes[c].value; "c@" == l ? a = o : "..." == l.substring(0, 3) ? (i = "", u = ",Object.assign({", r += "}," + l.substring(3) + ",{") : (r += i + '"' + l.replace(/:::(\w)/g, function (t, e) {
            return e.toUpperCase();
          }) + '":' + (!o || n(o, "+")), i = ",");
      } r = "h(" + a + u + r + "})"; for (var f = e.firstChild; f;) r += "," + t(f), f = f.nextSibling; return r + ")";
    }((e.content || e).firstChild));
  }(r)))(this, arguments);
}
//#endregion
export const html = htm.bind(h)
