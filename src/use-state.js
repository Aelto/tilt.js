import { getContext } from './context';

let setStateQueue = new Set();
let applyChangesAnimationId = null;

export default function useState(defaultValue) {
  /**
   * keep a copy of the currentLayer at the time useState was first used
   */
  const layer = getContext();

  /**
   * get a unique id for this state
   */
  const stateUniqueId = layer.getOrCreateContext();
  const value = layer.getUpdatedOrDefaultContextValue(stateUniqueId, defaultValue);

  const setter = updatedValue => {
    layer.context.set(stateUniqueId, updatedValue);

    if (applyChangesAnimationId !== null) {
      cancelAnimationFrame(applyChangesAnimationId);
    }

    setStateQueue.add(layer);
    applyChangesAnimationId = requestAnimationFrame(() => {
      for (const layer of setStateQueue) {
        const updatedHnode = layer.runComponent();
        layer.applyChanges(updatedHnode);
      }

      setStateQueue = new Set();
      applyChangesAnimationId = null;
    });
  };

  return [value, setter];
}
