const blockStyleSheet = new CSSStyleSheet();
blockStyleSheet.replaceSync(`:host { display: block; }`)
export class ArrowSectionElement extends HTMLElement {
  #internals = this.attachInternals();
  constructor() {
    super();
    this.#internals.role = "region";
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = "<slot></slot>";
    this.shadowRoot.adoptedStyleSheets = [blockStyleSheet];
  }

  static get observedAttributes() {
    return ["aria-label", "aria-labelledby"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "aria-label":
      case "aria-labelledby":
        break;
    }
  }
}
