// Taken from https://github.com/medialize/tokenlist/blob/26848b3085d081056dfc74056cf7895f6a1b777c/src/tokenlist.js#L13
const ASCII_WHITESPACE = /[\u0009\u000A\u000C\u000D\u0020]+/;

export class DOMTokenList {
	#set = new Set();

	// TODO: maybe refactor to use a WeakRef for the #element
	#element;
	#attribute;
	#updateDOM() {
		this.#element.setAttribute(this.#attribute, this.value);
	}

	constructor(element, attribute) {
		this.#element = element;
		this.#attribute = attribute;
		if (this.#element.hasAttribute(this.#attribute)) {
			this.value = this.#element.getAttribute(this.#attribute);
		}

		const relObserver = new MutationObserver(this.#updateFromDOM.bind(this));

		relObserver.observe(this.#element, {
			attributes: true,
			attributeFilter: [this.#attribute]
		});
	}

	#updateFromDOM() {
		const value = this.#element.getAttribute(this.#attribute);
		this.#set = new Set(value?.split(ASCII_WHITESPACE))
	}

	get length() {
		return this.#set.size;
	}

	get value() {
		return Array.from(this.#set).join(" ");
	}

	set value(value) {
		this.#set = new Set(value?.split(ASCII_WHITESPACE));
		this.#updateDOM();
	}

	item(index) {
		return Array.from(this.#set).at(index);
	}

	contains(token) {
		return this.#set.has(token);
	}

	add(...tokens) {
		for (const token of tokens) {
			// TODO: there’s another error here for syntax related stuff?
			// TODO: figure out the actual exception stuff
			if (token === "") throw new DOMException("token cannot be an empty string");
			this.#set.add(token);
		}
		this.#updateDOM();
	}

	remove(...tokens) {
		for (const token of tokens) {
			this.#set.delete(token);
		}
		this.#updateDOM();
	}

	replace(oldToken, newToken) {
		this.#set.delete(oldToken);
		this.#set.add(newToken);
		this.#updateDOM();
	}

	supports(token) {
		console.log("DOMTokenList: supports() method unimplemented");
	}
	toggle(token, force) {
		if (force != null) this.#set[force ? "add" : "delete"](token);
		if (this.#set.has(token)) this.#set.delete(token);
		else this.#set.add(token);
		this.#updateDOM();
	}

	entries() { return Array.from(this.#set).entries(); }
	keys() { return Array.from(this.#set).keys(); }
	values() { return Array.from(this.#set).values(); }

	forEach(callback, thisArg) {
		this.#set.forEach(callback, thisArg);
	}

	*[Symbol.iterator]() {
		for (const item of Array.from(this.#set)) yield item;
	}
}
