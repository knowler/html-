import { css, html } from "arrow-html/utils";
import { DOMTokenList } from "arrow-html/dom-token-list";
import { ArrowElement } from "arrow-html/element";

// Taken from https://github.com/medialize/tokenlist/blob/26848b3085d081056dfc74056cf7895f6a1b777c/src/tokenlist.js#L13
const ASCII_WHITESPACE = /[\u0009\u000A\u000C\u000D\u0020]+/;

const REFERRER_POLICIES = [
	"no-referrer",
	"no-referrer-when-downgrade",
	"origin",
	"origin-when-cross-origin",
	"same-origin",
	"strict-origin",
	"strict-origin-when-cross-origin",
	"unsafe-url",
];

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

	/** @type {ElementInternals} */
	#internals = this.attachInternals();

	/** @type {URL} */
	#url;

	#relList = new DOMTokenList(this, "rel", [
		"noopener",
		"noreferrer",
		"opener",
	]);

	constructor() {
		super();

		ArrowAnchorElement.#reflectURLProperties(this,
			"hash",
			"host",
			"hostname",
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

	/**
	 * @note This is a feature of our base `ArrowElement` and not a Web Components API
	 */
	static get reflectedAttributes() {
		return ["hreflang", "target", "download", "ping", "type", "rel"];
	}

	static get observedAttributes() {
		return ["href"];
	}

	connectedCallback() {
		window.addEventListener("hashchange", this, true);
	}

	disconnectedCallback() {
		window.removeEventListener("hashchange", this, true);
	}

	// Big assumption: `href` is the only observed attribute
	attributeChangedCallback(_name, _oldValue, newValue) {
		if (newValue == null) {
			this.#url = null;
			this.#internals.states.clear();
			return;
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

		// We don’t need to update the internal URL if its href prop already matches the new value
		if (this.href !== newValue) {
			this.#url = URL.canParse(newValue)
				? new URL(newValue)
				: new URL(newValue, this.baseURI);
		}

		this.#updateLocalLinkState();
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
				// Don’t click if there is selection
				if (event.altKey && getSelection().type === "Range") break;

				if (this.hasAttribute("download") && "showOpenFilePicker" in window) {
					this.#downloadFile();
					break;
				}

				const allowedFeatures = new Set(["noreferrer", "noopener", "opener"]);
				const windowFeatures = allowedFeatures.intersection(new Set(this.relList))

				// https://html.spec.whatwg.org/#hyperlink-auditing
				if (this.ping) {
					// TODO: need to split on ASCII white space (i.e. includes tab, returns, etc.)
					for (const urlString of this.ping.split(ASCII_WHITESPACE)) {
						if (URL.canParse(urlString)) {
							const url = new URL(urlString);
							if (!["http:", "https"].includes(url.protocol)) break;
							// TODO handle referrer stuff (what needs to happen)
							fetch(url, {
								method: "POST",
								body: "PING",
								keepalive: true,
								// TODO:
								// - Do we need to use the document’s referrer policy when ours isn’t set?
								// - Do we need to factor in `rel=noreferrer`? What should be given priority?
								referrerPolicy: this.referrerPolicy || undefined,
								headers: {
									"content-length": 4,
									"content-type": "text/ping",
									"ping-to": this.href,
									"ping-from": location.href,
								},
							});
						}
					}
				}

				// TODO:
				// - Do we need to use the document’s referrer policy when ours isn’t set?
				// - Do we need to factor in `rel=noreferrer`? What should be given priority?
				// We’re limited by what referrer policy stuff we can do here.
				// https://bugzilla.mozilla.org/show_bug.cgi?id=1433352
				window.open(
					this.href,
					event.metaKey ? "_blank" : this.target || "_self",
					Array.from(windowFeatures).join(","),
				);

				break;

			case "dragstart":
				if (event.defaultPrevented) break;

				// If there is text selection this shouldn’t drag the link itself (the default)
				if (getSelection().type !== "Range") {

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

			case "hashchange":
				this.#updateLocalLinkState();
				break;
		}
	}

	#updateLocalLinkState() {
		const isLocalLink = this.#url?.href === document.documentURI;
		this.#internals.states[isLocalLink ? "add" : "delete"]("local-link");
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
		// TODO:
		// - Do we need to use the document’s referrer policy when ours isn’t set?
		// - Do we need to factor in `rel=noreferrer`? What should be given priority?
		const headers = new Headers();
		const response = await fetch(this.href, {
			referrerPolicy: this.referrerPolicy,
		});
		await writable.write(await response.blob())
		await writable.close();
	}

	get referrerPolicy() {
		const value = this.getAttribute("referrerpolicy");
		return REFERRER_POLICIES.includes(value) ? value : "";
	}
	set referrerPolicy(value) {
		if (REFERRER_POLICIES.includes(value))
			this.setAttribute("referrerpolicy", value);
	}

	get relList() {
		return this.#relList;
	}
	set relList(value) {
		this.relList.value = value;
	}

	// Text content

	get text() {
		return this.textContent;
	}
	set text(value) {
		this.textContent = value;
	}

	// The getter/setter for the `href` property work differently:
	// - the getter will return the fully qualified URL
	// - the setter will just set the attribute (i.e. it supports relative URLs)

	get href() {
		return this.#url?.href ?? "";
	}

	set href(value) {
		this.setAttribute("href", value);
	}

	// Based on the href

	get origin() {
		return this.#url?.origin ?? "";
	}

	static #reflectURLProperties(instance, ...props) {
		Object.defineProperties(instance,
			props.reduce((defined, prop) => {
				defined[prop] = {
					get() {
						return instance.#url?.[prop] ?? "";
					},
					// Only allow modifications if we have a `href` attribute/stored URL object.
					set(value) {
						if (instance.#url) {
							instance.#url[prop] = value;
							instance.setAttribute("href", instance.#url.href);
						}
					},
				};
				return defined;
			}, {}),
		);
	}
}
