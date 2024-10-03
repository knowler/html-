import { ArrowElement } from "arrow-html/element";
import { css, html } from "arrow-html/utils";

export class ArrowAsideElement extends ArrowElement {
	static content = html`<slot></slot>`;
	static styles = css`
		:host {
			display: block;
			unicode-bidi: isolate;
		}

		/* TODO: styling h1? */
	`;

	#internals = this.attachInternals();

	connectedCallback() {
		// The accessible name has changed — re-run the algorithm
		this.#determineRole();
	}

	static get observedAttributes() {
		return ["aria-label", "arialabelledby"];
	}

	attributeChangedCallback() {
		// The accessible name has changed — re-run the algorithm
		this.#determineRole();
	}

	#determineRole() {
		const hasAccessibleName = !!this.#internals.ariaLabel;
		const scopedToSectioningContent = !!this.closest("article, aside, nav, section");
		const scopedToBodyOrMain = !!this.closest("body, main");

		this.#internals.role = 
			scopedToSectioningContent
				//https://www.w3.org/TR/html-aam-1.0/#el-aside
				? hasAccessibleName ? "complementary" : "generic"
				//https://www.w3.org/TR/html-aam-1.0/#el-aside-ancestorbodymain
				: scopedToBodyOrMain ? "complementary" : null;
	}
}
