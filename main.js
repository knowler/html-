const openingHighlight = new Highlight();
const arrowHighlight = new Highlight();

for (const h2 of document.querySelectorAll("h2")) {
  const [text] = h2.childNodes;

  const openingTag = new Range();
  openingTag.setStart(text, 0);
  openingTag.setEnd(text, 1);
  openingHighlight.add(openingTag);

  const arrowTag = new Range();
  arrowTag.setStart(text, text.length - 2);
  arrowTag.setEnd(text, text.length);
  arrowHighlight.add(arrowTag);
}

CSS.highlights.set("opening-tag", openingHighlight);
CSS.highlights.set("arrow-tag", arrowHighlight);
