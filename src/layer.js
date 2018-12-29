import { applyContext } from './context';

export default class Layer {
  constructor(hnode) {
    if (hnode.$$typeof === Symbol.for('component')) {
      this.component = hnode;
    } else {
      this.hnode = hnode;
    }

    this.events = new Map();
  }

  /**
   * initialize nested layers,
   * 1. create the id and context,
   * 2. create the node Element,
   * 3. call .firstRender() on all children
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
    applyContext(this);

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
      throw new Error('trying to get value from unknown context');
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
      throw new Error(
        'attempting to append `null` node to dom. May need to `.firstRender()` first'
      );
    }

    node.appendChild(this.node);
  }

  removeFromDom() {
    if (!this.node) {
      throw new Error('attempting to remove this node from the dom, but this.node is null');
    }

    this.node.parentElement.removeChild(this.node);
  }

  /**
   * make changes according to the supplied hnode
   * @param {*} hnode
   * @returns {bool} returns true if changes were made, false otherwise
   */
  applyChanges(hnode) {
    if (typeof this.hnode === 'string' || typeof this.hnode === 'number') {
      return this._applyChangesText(hnode);
    }

    if (hnode.$$typeof === Symbol.for('component')) {
      return this._applyChangesComponent(hnode);
    }

    if (this.hnode.nodeName !== hnode.nodeName) {
      return this._applyChangesDifferentNode(hnode);
    }

    let didUpdates = this._applyChangesSameNode(hnode);

    if (this.children.length === hnode.children.length) {
      for (let i = 0; i < this.children.length; i++) {
        const child = hnode.children[i];

        didUpdates = this.children[i].applyChanges(child) || didUpdates;
      }
    }
    // a new element was added to the children list
    else if (this.children.length < hnode.children.length) {
      let index = 0;

      for (index; index < hnode.children.length; index++) {
        const thisChild = this.children[index];
        const hnodeChild = hnode.children[index];

        if (!thisChild || !hnodeChild) {
          break;
        }

        thisChild.applyChanges(hnodeChild);
      }

      for (index; index < hnode.children.length; index++) {
        const hnodeChild = hnode.children[index];

        this.hnode.children.push(hnodeChild);

        const newLayer = new Layer(hnodeChild);
        newLayer.firstRender();
        newLayer.appendToDom(this.node);

        this.children.push(newLayer);
      }
    }
    // elements were removed from the children list
    else if (this.children.length > hnode.children.length) {
      if (!hnode.children.length) {
        for (const layer of this.children) {
          layer.removeFromDom();
        }

        this.children = [];

        return true;
      }

      for (let index = 0; index < hnode.children.length; index++) {
        const thisChild = this.children[index];
        const hnodeChild = hnode.children[index];

        thisChild.applyChanges(hnodeChild);
      }

      for (let index = hnode.children.length; index < this.children.length; index++) {
        const layer = this.children[index];

        layer.removeFromDom();
      }

      this.children = this.children.slice(0, hnode.children.length);
    }

    return didUpdates;
  }

  _applyChangesDifferentNode(hnode) {
    const newNode = this._nodeFromHnode(hnode);
    if (this.hnode.$$typeof === Symbol.for('hnode')) {
      this.children = hnode.children.map(child => new Layer(child));
      for (const child of this.children) {
        child.firstRender();
        child.appendToDom(newNode);
      }
    }
    this.node.parentElement.replaceChild(newNode, this.node);
    this.node = newNode;
    this.hnode = hnode;
    return true;
  }

  _applyChangesText(hnode) {
    if (this.hnode === hnode) {
      return false;
    } else {
      const newTextNode = this._nodeFromHnode(hnode);

      this.node.parentElement.replaceChild(newTextNode, this.node);
      this.node = newTextNode;
      this.hnode = hnode;

      return true;
    }
  }

  _applyChangesComponent(hnode) {
    this.prepareState();
    const res = hnode.fn(hnode.attributes);
    this.component.attributes = hnode.attributes;

    return this.applyChanges(res);
  }

  _applyChangesSameNode(hnode) {
    let shouldUpdateAttributes = false;
    let didUpdates = false;

    const thisAttrNames = Object.keys(this.hnode.attributes);
    const hnodeAttrNames = Object.keys(hnode.attributes);

    if (thisAttrNames.length !== hnodeAttrNames) {
      shouldUpdateAttributes = true;
    }

    for (const key of thisAttrNames) {
      if (this.hnode.attributes[key] !== hnode.attributes[key]) {
        shouldUpdateAttributes = true;
        didUpdates = true;
        break;
      }

      if (typeof hnode.attributes[key] === 'function') {
        shouldUpdateAttributes = true;
        break;
      }
    }

    if (shouldUpdateAttributes) {
      this._setNodeAttributes(this.node, hnode.attributes);
    }

    return didUpdates;
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
   *    all the events stored in `this.events[evt.type]`
   *
   * **NOTE**: this method clears all the stored events
   * @param {*} node
   * @param {*} attributesMap
   */
  _setNodeAttributes(node, attributes) {
    this.events.clear();

    for (const attrName in attributes) {
      const attrValue = attributes[attrName];

      if (typeof attrValue === 'function') {
        const event = attrName.startsWith('on') ? attrName.replace('on', '') : attrName;

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
      } else {
        if (node[attrName]) {
          node[attrName] = attrValue;
        }

        node.setAttribute(attrName, attrValue);
      }
    }
  }
}
