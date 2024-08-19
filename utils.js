export function css() {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(identity(...arguments));
	return sheet;
}

export function html() {
	const template = document.createElement("template");
	template.innerHTML = identity(...arguments);
	return template.content;
}

function identity(raw, ...expressions) {
	return String.raw({ raw }, ...expressions);
}

// TODO: this only handles strings, maybe split it out.
export function reflectAttributes(instance, ...attributes) {
	for (const attribute of attributes) {
		Object.defineProperty(instance, attribute, {
		get() {
				return instance.getAttribute(attribute) || "";
			},
			set(value) {
				instance.setAttribute(attribute, value || "");
			},
		});
	}
}
