export default function h(name, attributes, ...children) {
  // 1. exclude `null`, `true` and `false`
  // 2. exclude empty strings
  // 3. flatten the children array
  const childrenNodes = children
    .filter(c => c !== null && c !== true && c !== false) // 1.
    .filter(c => !c.trim || c.trim().length) // 2.
    .flatMap(c => c); // 3.

  if (typeof name === 'function') {
    return {
      fn: name,
      attributes,
      children: childrenNodes,
      $$typeof: Symbol.for('component')
    };
  }

  return {
    nodeName: name,
    attributes: attributes || {},
    children: childrenNodes,
    key: attributes && attributes.key,
    $$typeof: Symbol.for('hnode')
  };
}
