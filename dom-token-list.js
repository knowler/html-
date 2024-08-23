// Taken from https://github.com/medialize/tokenlist/blob/26848b3085d081056dfc74056cf7895f6a1b777c/src/tokenlist.js#L13
const ASCII_WHITESPACE = /[\u0009\u000A\u000C\u000D\u0020]+/;

export class DOMTokenList {
	#tokens = new Set();
	#element;
	#attribute;
	#supports;

	constructor(element, attribute, supports = []) {
		this.#element = new WeakRef(element);
		this.#attribute = attribute;
		this.#supports = new Set(supports);
		if (element.hasAttribute(attribute)) {
			this.value = element.getAttribute(attribute);
		}

		const relObserver = new MutationObserver(this.#updateFromDOM.bind(this));

		relObserver.observe(element, {
			attributes: true,
			attributeFilter: [attribute]
		});
	}

	get length() {
		return this.#tokens.size;
	}

	get value() {
		return Array.from(this.#tokens).join(" ");
	}

	set value(value) {
		this.#tokens = new Set(value?.split(ASCII_WHITESPACE));
		this.#updateDOM();
	}

	item(index) {
		return Array.from(this.#tokens).at(index);
	}

	contains(token) {
		return this.#tokens.has(token);
	}

	add(...tokens) {
		for (const token of tokens) {
			// TODO: there’s another error here for syntax related stuff?
			// TODO: figure out the actual exception stuff
			if (token === "") throw new DOMException("token cannot be an empty string");
			this.#tokens.add(token);
		}
		this.#updateDOM();
	}

	remove(...tokens) {
		for (const token of tokens) {
			this.#tokens.delete(token);
		}
		this.#updateDOM();
	}

	replace(oldToken, newToken) {
		this.#tokens.delete(oldToken);
		this.#tokens.add(newToken);
		this.#updateDOM();
	}

	supports(token) {
		return this.#supports.has(token);
	}

	toggle(token, force) {
		if (force != null) this.#tokens[force ? "add" : "delete"](token);
		else if (this.#tokens.has(token)) this.#tokens.delete(token);
		else this.#tokens.add(token);
		this.#updateDOM();
	}

	entries() { return Array.from(this.#tokens).entries(); }
	keys() { return Array.from(this.#tokens).keys(); }
	values() { return Array.from(this.#tokens).values(); }

	forEach(callback, thisArg) {
		this.#tokens.forEach(callback, thisArg);
	}

	*[Symbol.iterator]() {
		for (const item of Array.from(this.#tokens)) yield item;
	}

	#updateFromDOM() {
		const element = this.#element.deref();
		if (element) {
			const value = element.getAttribute(this.#attribute);
			this.#tokens = new Set(value?.split(ASCII_WHITESPACE))
		}
	}

	#updateDOM() {
		this.#element.deref()?.setAttribute(this.#attribute, this.value);
	}
}
