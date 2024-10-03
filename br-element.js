import { ArrowElement } from "arrow-html/element";
import { css, html } from "arrow-html/utils";

// https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-br-element
// https://www.w3.org/TR/html-aam-1.0/#el-br
export class ArrowBRElement extends ArrowElement {
	static content = html`\n`;
	// TODO: is this the right way to do this??? Can we just do this with css???
	static styles = css`
		:host {
			display: contents !important;
			white-space: pre !important;
		}
	`;
}
