const openingHighlight = new Highlight();
const arrowHighlight = new Highlight();

for (const heading of document.querySelectorAll(":is(:is(h1-, h2-, th) code:only-child)")) {
  const [text] = heading.childNodes;

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
