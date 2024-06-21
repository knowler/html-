/**
 * @note Work in progress
 */
export class ArrowButtonElement extends HTMLElement {
  static formAssociated = true;

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
        border: 1px solid color-mix(in hsl, ButtonBorder, Canvas 45%);
        border-radius: 3px;
        line-height: normal;
        box-sizing: border-box;
        cursor: default;
        text-align: center;
      }

      :host(:hover) {
        background-color: color-mix(in hsl, ButtonFace, CanvasText 8%);
        border-color: color-mix(in hsl, ButtonBorder, Canvas 30%);
      }

      :host(:state(active)) {
        background-color: color-mix(in hsl, ButtonFace, Canvas 30%);
        border-color: color-mix(in hsl, ButtonBorder, Canvas 60%);
      }
    `);
    this.#template.innerHTML = "<slot></slot>";
  }

  #internals = this.attachInternals();

  get labels() {
    return this.#internals.labels;
  }

  get form() {
    return this.#internals.form;
  }

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
    this.addEventListener("click", this);
    this.addEventListener("mousedown", this);
    this.addEventListener("mousemove", this);
  }

  static get observedAttributes() { return ["tabindex"]; }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "tabindex":
        if (newValue == null) this.setAttribute("tabindex", 0);
        break;
    }
  }

  handleEvent(event) {
    switch (event.type) {
      case "click":
        switch (this.getAttribute("type")) {
          case "button": break;
          case "reset": 
            this.#internals.form?.reset();
          break;
          case "submit":
          default:
            // TODO: can we pass this as the submitter?
            this.#internals.form?.requestSubmit();
            break;
        }
        break;
      case "mousedown":
        if (!event.altKey) event.preventDefault();
        this.#internals.states.add("active");
        this.ownerDocument.addEventListener("mouseup", this, { once: true });
        break;
      case "mousemove":
        event.preventDefault();
        break;
      case "mouseup":
        this.#internals.states.delete("active");
        break;
    }
  }
}
