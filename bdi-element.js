import { ArrowElement } from "arrow-html/element";
import { css, html } from "arrow-html/utils";

// https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-bdi-element
// https://www.w3.org/TR/html-aam-1.0/#el-bdi
export class ArrowBDIElement extends ArrowElement {
	static content = html`<slot></slot>`;
	static styles = css`
		:host {
			unicode-bidi: isolate;
		}
	`;

	#internals = this.attachInternals();

	constructor() {
		super();

		this.#internals.role = "generic";
	}
}
