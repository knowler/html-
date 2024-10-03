import { ArrowElement } from "arrow-html/element";
import { css, html } from "arrow-html/utils";

export class ArrowBlockquoteElement extends ArrowElement {
	static content = html`<slot></slot>`;
	static styles = css`
		:host {
			display: block;
			unicode-bidi: isolate;
			margin-block: 1em;
			margin-inline: 40px;
		}
	`;

	#internals = this.attachInternals();

	constructor() {
		super();

		// https://www.w3.org/TR/html-aam-1.0/#el-blockquote
		this.#internals.role = "blockquote";
	}

	static get reflectedAttributes() {
		return ["cite"];
	}
}
