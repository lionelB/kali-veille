export function astify(data, depth = 0) {
  const {
    etat,
    id,
    idcc,
    cid,
    intOrdre,
    dateModif,
    title,
    shortTitle,
    articles = [],
    sections = []
  } = data;
  const node = {
    type: "section",
    data: { intOrdre, title, id, cid, etat }
  };

  if (dateModif) {
    node.data.dateModif = dateModif;
  }
  if (depth === 0) {
    node.data.idcc = parseInt(idcc, 10);
    if (shortTitle) {
      node.shortTitle = shortTitle;
    }
  }
  let childSections = [];
  let childArticles = [];
  if (sections.length) {
    childSections = sections.map(node => astify(node, depth + 1));
  }
  if (articles.length) {
    childArticles = articles.map(article => ({
      type: "article",
      data: article
    }));
  }
  node.children = [].concat(childSections, childArticles);
  return node;
}
