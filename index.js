import fs from "fs";
import path from "path";
import { promisify } from "util";
import pMap from "p-map";
import pPipe from "p-pipe";

import { getKaliContIdcc, getKaliCont } from "./api";
import idccList from "./idcc.json";
import { astify } from "./astify";
import filter from "unist-util-flat-filter";

const readFile = promisify(fs.readFile);

async function main() {
  const pipeline = pPipe(
    readKaliCont,
    toJson,
    astify,
    createSearcherSince("2020-01-01"),
    ref2md
  );

  // const pTextes = [2420].map(idcc =>
  const pTextes = idccList.map(idcc =>
    pipeline(idcc).catch(error => {
      throw { idcc, error };
    })
  );
  return (await Promise.all(pTextes)).filter(Boolean);
}

const createSearcherSince = date => tree => getUpdateSince(tree, date);

function getUpdateSince(tree, date) {
  const subTree = filter(
    tree,
    ({ type, data, data: { lstLienModification = [] } }) => {
      if (type !== "article") return false;

      if (!lstLienModification.length) return false;
      return lstLienModification.some(
        ({ dateSignaTexte }) => dateSignaTexte && dateSignaTexte > date
      );
    }
  );
  if (!subTree) {
    return null;
  }
  const updates = subTree.children.flatMap(
    ({ data: { id, num, lstLienModification } }) => {
      return lstLienModification.map(
        ({ textCid, textTitle, articleId, articleNum }) => {
          return {
            modifiedArticle: id,
            modifiedArticleNum: num || "•",
            textCid,
            textTitle,
            articleNum,
            articleId
          };
        }
      );
    }
  );
  return { date, idcc: tree.data.idcc, updates };
}

const readKaliCont = idcc =>
  readFile(path.join(__dirname, "raw", `${idcc}.json`));

const toJson = buffer => JSON.parse(buffer.toString());

const ref2md = refs => {
  if (!refs) {
    return;
  }
  const { date, idcc, updates } = refs;
  return `
# IDCC ${idcc} Liste des changement depuis le __${date}__
${updates
  .map(
    update =>
      `- ${getUrl(
        `Art ${update.modifiedArticleNum}`,
        update.modifiedArticle
      )} modifié par ${getUrl(update.textTitle, update.articleId)}`
  )
  .join("\n")}
`;
};

const getUrl = (text, id) => {
  if (id.startsWith("KALIART")) {
    return getMdLink(
      text,
      `https://beta.legifrance.gouv.fr/conv_coll/id/${id}`
    );
  }
  if (id.startsWith("JOR")) {
    return getMdLink(
      text,
      `https://beta.legifrance.gouv.fr/jorf/texte_jo/${id}`
    );
  }
  return id;
};

const getMdLink = (text, url) => `[${text}](${url})`;

if (require.main === module) {
  main()
    .then(data => {
      console.log(data.join("\n"));
    })
    .catch(console.error);
}
