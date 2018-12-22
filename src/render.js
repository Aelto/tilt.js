import Layer from './layer';

let app;

export default function render(hnode, domRoot) {
  app = new Layer(hnode);

  app.firstRender();
  app.appendToDom(domRoot);

  return app;
}
