export class ArrowDetailsElement from HTMLElement {
  static formAssociated = true;

  static #template = document.createElement("template");
  static #styleSheet = new CSSStyleSheet();
  static {
    this.#template.innerHTML = `
      <slot name="summary"><summary->Details</summary-></slot>
      <slot part="details-content"></slot>
    `;
  }

  #internals = this.attachInternals();

  constructor() {
    super();
    this.#internals.role = "group";
    this.attachShadow({
      mode: "open",
    });

    this.shadowRoot.append(this.constructor.#template.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets = [this.constructor.#styleSheet];
  }
}
