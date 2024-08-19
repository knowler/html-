import { reflectAttributes } from "arrow-html/utils";

export class ArrowElement extends HTMLElement {
	constructor() {
		super();

		if (this.constructor.reflectedAttributes) {
			reflectAttributes(this, this.constructor.reflectedAttributes);
		}

		this.attachShadow({ mode: "open" });

		if (this.constructor.content) {
			this.shadowRoot.append(this.constructor.content.cloneNode(true));
		}

		if (this.constructor.styles) {
			this.shadowRoot.adoptedStyleSheets = [this.constructor.styles];
		}
	}

	// Definition helper
	static define(tagName = this.tagName) {
		if (!customElements.get(tagName)) {
			customElements.define(tagName, this);
			window[this.name] = this;
		}
	}
}

