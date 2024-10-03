import { ArrowElement } from "arrow-html/element";
import { css, html } from "arrow-html/utils";

export class ArrowArticleElement extends ArrowElement {
	static content = html`<slot></slot>`;
	static styles = css`
		:host {
			display: block;
			unicode-bidi: isolate;
		}

		/* TODO: styling h1? */
	`;

	#internals = this.attachInternals();

	constructor() {
		super();

		this.#internals.role = "article";
	}
}
