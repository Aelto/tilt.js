export default function h(name, attributes) {
  var rest = [];
  var children = [];
  var length = arguments.length;

  while (length-- > 2) rest.push(arguments[length]);

  while (rest.length) {
    var node = rest.pop();
    if (node && node.pop) {
      for (length = node.length; length--; ) {
        rest.push(node[length]);
      }
    } else if (node != null && node !== true && node !== false) {
      if (node.trim && !node.trim().length) {
        continue;
      }

      children.push(node);
    }
  }

  if (typeof name === 'function') {
    return {
      fn: name,
      attributes,
      children,
      $$typeof: Symbol.for('component')
    };
  }

  return {
    nodeName: name,
    attributes: attributes || {},
    children: children,
    key: attributes && attributes.key,
    $$typeof: Symbol.for('hnode')
  };
}
