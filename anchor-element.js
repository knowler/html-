export class HTMLArrowAnchorElement extends HTMLElement {
  static #template = document.createElement("template");
  static #styleSheet = new CSSStyleSheet();
  static {
    this.#styleSheet.replaceSync(`
      :host([href]) {
        color: LinkText;
        text-decoration: underline;
      }
    `);
    this.#template.innerHTML = "<slot></slot>";
  }

  #internals = this.attachInternals();
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [this.constructor.#styleSheet];
    this.shadowRoot.append(this.constructor.#template.content.cloneNode(true));

    // TODO: link functionality
  }

  // TODO: accept user tab index
  static get observedAttributes() { return ["href"]; }
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(arguments);
    switch (name) {
      case "href":
        if (newValue === null) {
          delete this.#internals.role;
          this.removeAttribute("tabindex");
        } else {
          this.#internals.role = "link";
          this.tabIndex = 0;
        }
        break;
    }
  }
}
