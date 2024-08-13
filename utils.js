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
