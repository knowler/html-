import { css, html } from "arrow-html/utils"

export class ArrowAnchorElement extends HTMLElement {
	static content = html`<slot></slot>`;
	static styles = css`
		:host([href]) {
			color: LinkText;
			text-decoration: underline;
			cursor: pointer;
			outline-offset: 1px;
		}

		/* ActiveText and VisitedText don’t seem to work at all here */
		:host([href]:state(visited)) {
			color: VisitedText;
			color: rgb(85 26 139);
		}
		:host([href]:state(active)) {
			color: ActiveText;
			color: red;
		}
	`;

	#internals = this.attachInternals();

	#url;

	constructor() {
		super();

		this.attachShadow({ mode: "open" });

		this.shadowRoot.adoptedStyleSheets = [ArrowAnchorElement.styles];
		this.shadowRoot.append(ArrowAnchorElement.content.cloneNode(true));

		this.#internals.role = "generic";

		this.addEventListener("click", this);
		this.addEventListener("keydown", this);
		this.addEventListener("mousedown", this);
		this.addEventListener("mousemove", this);
	}

	// TODO: accept user tab index
	static get observedAttributes() {
		return ["href"];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case "href": {

				this.#internals.role = newValue != null ? "link" : "generic";

				if (this.#internals.role === "link") this.setAttribute("tabindex", 0);
				else this.removeAttribute("tabindex");

				this.#url = URL.canParse(newValue)
					? new URL(newValue)
					: new URL(newValue, this.baseURI);

				break;
			}
		}
	}

	handleEvent(event) {
		switch (event.type) {
			case "keydown":
				if (event.code !== "Enter") break;
			case "click":
				if (this.hasAttribute("download") && "showOpenFilePicker" in window) {
					this.#downloadFile();
					break;
				}

				// TODO: how do we factor in referrerpolicy
				// Also, we probably need to use the document’s default.
				let windowfeatures = [];

				if (this.rel.includes("noreferrer")) windowfeatures.push("noreferrer");
				if (this.rel.includes("noopener")) windowfeatures.push("noopener");
				//if (this.rel.includes("opener")) windowfeatures.push("opener");

				if (this.ping) {
					for (const url of this.ping.split(" ")) {
						if (URL.canParse(url)) {
							// TODO handle referrer stuff (what needs to happen)
							fetch(url, {
								method: "POST",
								body: "PING",
								keepalive: true, // Assuming this, but need to test
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
			case "mousedown":
				if (!event.altKey) event.preventDefault();
				this.#internals.states.add("active");
				this.ownerDocument.addEventListener("mouseup", this, { once: true });
				break;
			case "mousemove":
				// TODO why?
				event.preventDefault();
				break;
			case "mouseup":
				this.#internals.states.delete("active");
				break;
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

	// Reflected attributes

	get href() {
		return this.#url.href;
	}

	set href(value) {
		this.setAttribute("href", value);
	}

	get hreflang() {
		return this.getAttribute("hreflang") ?? "";
	}

	set hreflang(value) {
		this.setAttribute("hreflang", value);
	}

	get target() {
		return this.getAttribute("target") ?? "";
	}

	set target(value) {
		this.setAttribute("target", value);
	}

	// NOTE: this is the name for the download and not a boolean of
	// whether or not the file should download.
	get download() {
		return this.getAttribute("download") ?? "";
	}

	set download(value) {
		this.setAttribute("download", value);
	}

	get type() {
		return this.getAttribute("type") ?? "";
	}

	set type(value) {
		this.setAttribute("type", value)
	}

	// The spec says this should be limited to only known values
	get referrerPolicy() {
		return this.getAttribute("referrerpolicy") ?? "";
	}

	set referrerPolicy(value) {
		this.setAttribute("referrerpolicy", value);
	}

	get rel() {
		return this.getAttribute("rel") ?? "";
	}

	set rel(value) {
		this.setAttribute("rel", value);
	}

	get ping() {
		return this.getAttribute("ping") ?? "";
	}

	set ping(value) {
		this.setAttribute("ping", value);
	}

	// TODO: we don’t have a DOMTokenList
	relList = "unimplemented";

	// Based on the href

	get origin() {
		return this.#url.origin;
	}

	get hash() {
		return this.#url.hash;
	}

	set hash(value) {
		this.#url.hash = value;
		this.href = this.#url.href;
	}

	get hostname() {
		return this.#url.hostname;
	}

	set hostname(value) {
		this.#url.hostname = value;
		this.href = this.#url.href;
	}

	get port() {
		return this.#url.port;
	}

	set port(value) {
		this.#url.port = value;
		this.href = this.#url.href;
	}

	get protocol() {
		return this.#url.protocol;
	}

	set protocol(value) {
		this.#url.protocol = value;
		this.href = this.#url.href;
	}

	get search() {
		return this.#url.search;
	}

	set search(value) {
		this.#url.search = value;
		this.href = this.#url.href;
	}

	get username() {
		return this.#url.username;
	}

	set username(value) {
		this.#url.username = value;
		this.href = this.#url.href;
	}

	get password() {
		return this.#url.password;
	}

	set password(value) {
		this.#url.password = value;
		this.href = this.#url.href;
	}

	// Text content

	get text() {
		return this.textContent;
	}

	set text(value) {
		this.textContent = value;
	}

	// Definition helper

	static define(tagName = "a-") {
		if (!customElements.get(tagName)) {
			customElements.define(tagName, this);
			window[this.name] = this;
		}
	}
}
