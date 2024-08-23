import { css, html } from "arrow-html/utils";
import { ArrowElement } from "arrow-html/element";

/**
 * @see https://html.spec.whatwg.org/#the-a-element
 */
export class ArrowAnchorElement extends ArrowElement {
	static tagName = "a-";
	static content = html`<slot></slot>`;
	static styles = css`
		:host([href]) {
			color: LinkText;
			color: -WebKit-Link;
			text-decoration: underline;
			cursor: pointer;
			user-select: text;
		}

		:host([href]:active) {
			color: ActiveText;
			color: -WebKit-ActiveLink;
		}
	`;

	#internals = this.attachInternals();

	#url;

	constructor() {
		super();

		ArrowAnchorElement.#reflectURLProperties(this,
			"hash",
			"host",
			"hostname",
			"href",
			"password",
			"pathname",
			"port",
			"protocol",
			"search",
			"username",
		);

		// https://w3c.github.io/html-aam/#el-a-no-href
		this.#internals.role = "generic";

		this.addEventListener("pointerenter", this);
		this.addEventListener("pointerleave", this);
		this.addEventListener("dragstart", this);
		this.addEventListener("dragend", this);
		this.addEventListener("keydown", this);
		this.addEventListener("click", this);
	}

	static get reflectedAttributes() {
		return ["hreflang", "target", "download", "ping", "type", "rel"];
	}
	// TODO: accept user tab index
	static get observedAttributes() {
		return ["href"];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case "href": {

				if (newValue == null) {
					this.#url = null;
					break;
				}

				// https://w3c.github.io/html-aam/#el-a
				// https://w3c.github.io/html-aam/#el-a-no-href
				this.#internals.role = newValue != null ? "link" : "generic";

				if (this.#internals.role === "link") {
					this.setAttribute("tabindex", 0);
					this.setAttribute("draggable", "true");
				} else {
					this.removeAttribute("tabindex");
					this.removeAttribute("draggable");
				}

				// TODO: this is broken?
				if (this.href !== newValue) {
					this.#url = URL.canParse(newValue)
						? new URL(newValue)
						: new URL(newValue, this.baseURI);
				}

				break;
			}
		}
	}

	handleEvent(event) {
		switch (event.type) {

			case "pointerenter":
				if (event.altKey) this.draggable = false;
				this.#draggableController = new AbortController();
				window.addEventListener("keyup", this.#handleShouldBeDraggable.bind(this), {
					signal: this.#draggableController.signal,
				});
				window.addEventListener("keydown", this.#handleShouldBeDraggable.bind(this), {
					signal: this.#draggableController.signal,
				});
				break;

			// TODO: is this reliable? What if the window loses focus.
			case "pointerleave":
				this.draggable = true;
				this.#draggableController.abort();
				break;

			case "keydown":
				if (event.code !== "Enter") break;
			case "click":
				if (event.altKey) break;

				if (this.hasAttribute("download") && "showOpenFilePicker" in window) {
					this.#downloadFile();
					break;
				}

				// TODO: how do we factor in referrerpolicy
				// Also, we probably need to use the document’s default.
				let windowfeatures = [];

				if (this.rel.includes("noreferrer")) windowfeatures.push("noreferrer");
				if (this.rel.includes("noopener")) windowfeatures.push("noopener");
				if (this.rel.includes("opener")) windowfeatures.push("opener");

				// https://html.spec.whatwg.org/#hyperlink-auditing
				if (this.ping) {
					// TODO: need to split on ASCII white space (i.e. includes tab, returns, etc.)
					for (const urlString of this.ping.split(" ")) {
						if (URL.canParse(urlString)) {
							const url = new URL(urlString);
							if (!["http:", "https"].includes(url.protocol)) break;
							// TODO handle referrer stuff (what needs to happen)
							fetch(url, {
								method: "POST",
								body: "PING",
								mode: "no-cors",
								// A guess
								priority: "low",
								keepalive: true,
								headers: {
									"content-length": 4,
									// These don’t seem to work
									"content-type": "text/ping",
									"ping-to": this.href,
									"ping-from": location.href,
								},
							});
						}
					}
				}

				window.open(
					this.href,
					event.metaKey ? "_blank" : this.target || "_self",
					windowfeatures.join(",")
				);

				break;

			case "dragstart":
				if (event.defaultPrevented) break;

				// If there is text selection this shouldn’t drag the link itself (the default)
				// TODO: This isn’t very thorough
				const [textNode] = event.target.childNodes;
				if (textNode && !getSelection().containsNode(textNode)) {

					// This works for WebKit (but we can’t set a title)
					event.dataTransfer.setData("text/plain", this.href);

					// This works for Chromium (but we can’t set a title)
					event.dataTransfer.setData("text/uri-list", this.href);

					// This does nothing (but in Chromium anchors include outerHTML; Firefox does this including the parent element?).
					event.dataTransfer.setData("text/html", this.outerHTML);

					// This works for Firefox
					// This is problematic when dragging to a Finder window since
					// it seems to include an extra `\r` at the end of the URL.
					event.dataTransfer.setData("text/x-moz-url", `${this.href}\r\n${this.text}`);

				// TODO: maybe set a preview image?
				}
				break;
		}
	}

	#draggableController;
	#handleShouldBeDraggable(event) {
		if (event.key === "Alt") {
			if (event.type === "keydown") this.draggable = false;
			if (event.type === "keyup") this.draggable = true;
		}
	}

	async #downloadFile() {
		const handle = await window.showSaveFilePicker({
			startIn: "downloads",
			suggestedName: this.download ?? this.#url.pathname,
		});
		const writable = await handle.createWritable();
		// TODO: set referrer-related headers
		const response = await fetch(this.href);
		await writable.write(await response.blob())
		await writable.close();
	}

	#allowedReferrerPolicies = new Set(
		"no-referrer",
		"no-referrer-when-downgrade",
		"origin",
		"origin-when-cross-origin",
		"same-origin",
		"strict-origin",
		"strict-origin-when-cross-origin",
		"unsafe-url",
	);

	// The spec says this should be limited to only known values
	// TODO: is there a platform-provided list of these?
	get referrerPolicy() {
		const values = this.getAttribute("referrerpolicy");
		return this.#allowedReferrerPolicies.has(value) ? value : "";
	}

	set referrerPolicy(value) {
		if (this.#allowedReferrerPolicies.has(value))
			this.setAttribute("referrerpolicy", value);
	}

	// TODO: we don’t have a DOMTokenList
	relList = "unimplemented";

	// Based on the href

	get origin() {
		return this.#url.origin;
	}

	// Text content

	get text() {
		return this.textContent;
	}

	set text(value) {
		this.textContent = value;
	}

	// Static reflection helpers
	static #reflectURLProperties(instance, ...props) {
		Object.defineProperties(instance,
			props.reduce((defined, prop) => {
				defined[prop] = {
					get() {
						return instance.#url?.[prop] ?? "";
					},
					set(value) {
						instance.#url[prop] = value;
						instance.setAttribute("href", instance.#url.href);
					},
				};
				return defined;
			}, {}),
		);
	}
}
