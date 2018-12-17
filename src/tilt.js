
let app;
let currentLayer;

class Layer {
  constructor(hnode) {
    if (hnode.$$typeof === Symbol.for('component')) {
      this.component = hnode;
    }
    else {
      this.hnode = hnode;
    }

    this.events = new Map();
  }

  /**
   * initialize layers recursively,
   * 1. create the id and context,
   * 2. create the node Element,
   */
  firstRender() {
    /**
     * `Symbol` ensures this.id is unique
     */
    this.id = Symbol('layer');

    /**
     * Layer.context is a map whose key is a unique key
     * generated and kept in memory by a closure when
     * calling useState() using this as a currentLayer,
     * the value is simply the stored value and can be anything
     */
    this.context = new Map();

    /**
     * keeps the order in which the pairs in context were added
     */
    this.contextOrder = [];

    /**
     * 
     */
    this.contextIndex = -1;

    if (this.component) {
      this.hnode = this.runComponent();
    }
    
    this.node = this._nodeFromHnode(this.hnode);

    if (this.hnode.$$typeof === Symbol.for('hnode')) {
      this.children = this.hnode.children.map(hnode => new Layer(hnode));

      for (const child of this.children) {
        child.firstRender();
        child.appendToDom(this.node);
      }
    }
  }

  runComponent() {
    this.prepareState();

    const result = this.component.fn(this.component.attributes);
    return result;
  }

  prepareState() {
    currentLayer = this;

    this.contextIndex = -1;
  }

  getOrCreateContext() {
    const nextIndex = ++this.contextIndex;
    const contextKey = this.contextOrder[nextIndex];

    if (!contextKey) {
      const stateUniqueId = Symbol('state.id');
      
      this.context.set(stateUniqueId, undefined);
      this.contextOrder.push(stateUniqueId);

      return stateUniqueId;
    }
    
    return contextKey;
  }

  getUpdatedOrDefaultContextValue(contextKey, defaultValue) {
    if (!this.context.has(contextKey)) {
      throw new Error('trying to get value from unknown context')
    }

    const contextValue = this.context.get(contextKey);

    if (contextValue === undefined) {
      this.context.set(contextKey, defaultValue);

      return defaultValue;
    }

    return contextValue;
  }

  appendToDom(node) {
    if (!this.node) {
      throw new Error('attempting to append `null` node to dom. May need to `.firstRender()` first');
    }

    node.appendChild(this.node);
  }

  applyChanges(hnode) {
    if (typeof this.hnode === 'string' || typeof this.hnode === 'number') {
      const newTextNode = this._nodeFromHnode(hnode);

      this.node.parentElement.replaceChild(newTextNode, this.node);
      this.node = newTextNode;
      this.hnode = hnode;

      return;
    }

    if (hnode.$$typeof === Symbol.for('component')) {
      const res = hnode.fn(hnode.attributes);
      this.applyChanges(res);
    }

    if (this.hnode.nodeName === hnode.nodeName) {
      this._setNodeAttributes(this.node, hnode.attributes);
    }

    // TODO: handle list rendering

    if (this.children.length === hnode.children.length) {
      for (let i = 0; i < this.children.length; i++) {
        const child = hnode.children[i];

        this.children[i].applyChanges(child);
      }
    }

  }

  /**
   * create a Node Element from the supplied hnode
   * @param {*} hnode Object returning from the `h` function
   */
  _nodeFromHnode(hnode) {
    if (typeof hnode === 'number' || typeof hnode === 'string') {
      return document.createTextNode(hnode);
    }

    const { nodeName, attributes } = hnode;
    const node = document.createElement(nodeName);

    this._setNodeAttributes(node, attributes);

    return node;
  }

  /**
   * set the node the supplied attributes,
   * if an attribute is a function:
   *  - add a custom event which will, once triggered, call 
   *    all the events stored in `this.events`
   * 
   * **NOTE**: this methods clear all the stored events
   * @param {*} node 
   * @param {*} attributesMap 
   */
  _setNodeAttributes(node, attributes) {
    this.events.clear();

    for (const attrName in attributes) {
      const attrValue = attributes[attrName];

      if (typeof attrValue === 'function') {
        const event = attrName.startsWith('on')
          ? attrName.replace('on', '')
          : attrName;

        node[attrName] = e => {
          if (this.events.has(e.type)) {
            for (const evt of this.events.get(e.type)) {
              evt(e);
            }
          }
        };

        if (!this.events.has(event)) {
          this.events.set(event, []);
        }

        this.events.get(event).push(attrValue);
      }
      else {
        node.setAttribute(attrName, attrValue);
      }
    }
  }
}

export function useState(defaultValue) {
  /**
   * keep a copy of the currentLayer at the time useState was first used
   */
  const layer = currentLayer;

  /**
   * get a unique id for this state
   */
  const stateUniqueId = layer.getOrCreateContext();
  const value = layer.getUpdatedOrDefaultContextValue(stateUniqueId, defaultValue);

  const setter = updatedValue => {
    layer.context.set(stateUniqueId, updatedValue);
    
    const updatedHnode = layer.runComponent();
    layer.applyChanges(updatedHnode);
  };

  return [value, setter];
}

/**
 * tilt app entry point
 */
export function render(hnode, domRoot) {
  app = new Layer(hnode);

  app.firstRender();
  app.appendToDom(domRoot);

  return app;
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
