import h from './h';
import htm from 'htm';

export { default as render } from './render';
export { default as useState } from './use-state';

export const html = htm.bind(h);
