const template = document.createElement("template");
const styleSheet = new CSSStyleSheet();
template.innerHTML = "<slot></slot>";
styleSheet.replaceSync(`
  :host {
    display: block;
    font-weight: bold;
  }
`);

export class ArrowHeadingElement extends HTMLElement {
  #internals = this.attachInternals();

  set level(level) {
    this.#internals.ariaLevel = level;
  }

  get level() {
    return this.#internals.ariaLevel;
  }

  constructor() {
    super();
    this.#internals.role = "heading";

    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
  }
}
