import { ArrowElement } from "arrow-html/element";
import { css, html } from "arrow-html/utils";

// https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-bdo-element
// https://www.w3.org/TR/html-aam-1.0/#el-bdo
export class ArrowBDOElement extends ArrowElement {
	static content = html`<slot></slot>`;
	static styles = css`
		:host, :host([dir]) {
			unicode-bidi: isolate-override;
		}
	`;

	#internals = this.attachInternals();

	constructor() {
		super();

		this.#internals.role = "generic";
	}
}
