export class ArrowAnchorElement extends HTMLElement {
  static #template = document.createElement("template");
  static #styleSheet = new CSSStyleSheet();
  static {
    this.#styleSheet.replaceSync(`
      :host([href]) {
        color: LinkText;
        text-decoration: underline;
        cursor: pointer;
        outline-offset: 1px;
      }

      /* ActiveText and VisitedText don’t seem to work at all here */
      :host([href]:state(visited)) {
        color: rgb(85 26 139);
      }
      :host([href]:state(active)) {
        color: red;
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

    this.#internals.role = "generic";

    // TODO: link functionality
    this.addEventListener("click", this);
    this.addEventListener("mousedown", this);
    this.addEventListener("mousemove", this);
  }

  // TODO: accept user tab index
  static get observedAttributes() { return ["href"]; }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "href":
        if (newValue === null) {
          this.#internals.role = "generic";
          this.removeAttribute("tabindex");
          this.#internals.states.delete("visited");
        } else {
          this.#internals.role = "link";
          this.tabIndex = 0;
          const url = new URL(newValue, location.href);
          if (url.href === location.href) this.#internals.states.add("visited");
          else this.#internals.states.delete("visited");
        }
        break;
    }
  }

  handleEvent(event) {
    switch (event.type) {
      case "click":
        if (this.hasAttribute("href")) {
          // Probably not doing this great
          history.pushState({}, null, this.getAttribute("href"));
          // Might be better do this on popstate
          const url = new URL(this.getAttribute("href"), location.href);
          if (url.href === location.href) this.#internals.states.add("visited");
          else this.#internals.states.delete("visited");
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
