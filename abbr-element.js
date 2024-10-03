import { ArrowElement } from "arrow-html/element";
import { css, html } from "arrow-html/utils";

export class ArrowAbbrElement extends ArrowElement {
	static content = html`<slot></slot>`;
	static styles = css`
		:host([title]) {
			text-decoration: underline dotted;
		}
	`;
}
