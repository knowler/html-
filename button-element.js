/**
 * @note Work in progress
 */
export class ArrowButtonElement extends HTMLElement {
  static #template = document.createElement("template");
  static #styleSheet = new CSSStyleSheet();
  static {
    this.#styleSheet.replaceSync(`
      :host {
        display: inline-block;
        color: ButtonText;
        background-color: ButtonFace;
        font-family: Arial;
        font-size: 13.3333px;
        padding-inline: 6px;
        padding-block: 2px;
        border: 1px outset ButtonBorder;
        border-radius: 3px;
        line-height: normal;
        box-sizing: border-box;
        cursor: default;
      }
    `);
    this.#template.innerHTML = "<slot></slot>";
  }

  #internals = this.attachInternals();

  constructor() {
    super();

    this.#internals.role = "button";
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [this.constructor.#styleSheet];
    this.shadowRoot.append(this.constructor.#template.content.cloneNode(true));

    // Sprouting the tabindex since it’s easier than the weird ass styling for delegated focus
    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;

    // TODO: focusability (a tough one as tabindex is limited)
    // TODO: add event handlers for click and keyboard
  }

  static get observedAttributes() { return ["tabindex"]; }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "tabindex":
        if (newValue == null) this.setAttribute("tabindex", 0);
        break;
    }
  }
}
