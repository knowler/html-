import { ArrowElement } from "arrow-html/element";
import { css, html } from "arrow-html/utils";

export class ArrowAddressElement extends ArrowElement {
	static content = html`<slot></slot>`;
	static styles = css`
		:host {
			display: block;
			font-style: italic;
			unicode-bidi: isolate;
		}
	`;

	#internals = this.attachInternals();

	constructor() {
		super();

		this.#internals.role = "group";
	}
}
