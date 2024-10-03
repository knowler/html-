import { ArrowElement } from "arrow-html/element";
import { css, html } from "arrow-html/utils";

// https://www.w3.org/TR/html-aam-1.0/#el-b
export class ArrowBElement extends ArrowElement {
	static content = html`<slot></slot>`;
	static styles = css`
		:host {
			font-weight: bold;
		}
	`;

	#internals = this.attachInternals();

	constructor() {
		super();

		this.#internals.role = "generic";
	}
}
