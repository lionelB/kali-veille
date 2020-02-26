import fs from "fs";
import path from "path";
import Queue from "p-queue";
import pPipe from "p-pipe";

import { promisify } from "util";

import { getKaliContIdcc, getKaliText } from "./api";
// import { astify } from "./astify";
// import idccList from "./idcc.json";

const idccList = [
  // 16,
  // 29,
  // 44,
  // 86,
  // 176,
  // 275,
  // 292,
  // 413,
  // 573,
  // 650,
  // 675,
  // 787,
  // 804 => Error,
  // 843,
  // 1043,
  // 1090,
  // 1147,
  // 1266,
  // 1351,
  // 1404,
  // 1480,
  // 1483,
  // 1486,
  // 1501,
  // 1505,
  // 1516,
  // 1517,
  // 1518,
  // 1527,
  // 1596,
  // 1597,
  // 1606,
  // 1672,
  // 1702,
  // 1740,
  // 1979,
  // 1996,
  // 2098,
  // 2111,
  // 2120,
  // 2148,
  // 2216,
  // 2264,
  // 2395,
  // 2420,
  // 2511,
  // 2596,
  // 2609,
  // 2614,
  // 2941,
  // 3043,
  // 3127
];

const writeFile = promisify(fs.writeFile);
const queue = new Queue({ concurrency: 5, intervalCap: 10, interval: 1000 });
let count = 0;
let t0 = Date.now();

queue.on("empty", () => {
  console.log(" ‹› queue empty");
});

queue.on("active", () => {
  console.log(
    `${toFix((Date.now() - t0) / 1000)}   › item #${++count}.  Size: ${
      queue.size
    }  Pending: ${queue.pending}`
  );
});

async function main() {
  const pipeline = pPipe(
    fetchIdcc,
    fixContainerMeta,
    fetchAdditionalText,
    saveFile
  );
  for (const idcc of idccList) {
    console.log("›› fetch texte de base ", idcc);
    await pipeline(idcc);
  }
  console.log(">>> end");
}

function fetchIdcc(idcc) {
  return queue.add(() => getKaliContIdcc(idcc));
}

function fixContainerMeta(container) {
  const { id, titre: title, num, categorisation, sections } = container;
  const shortTitle =
    categorisation && categorisation.length ? categorisation[0] : title;

  return { id, title, idcc: parseInt(num, 10), shortTitle, sections };
}

async function fetchAdditionalText(container) {
  if (!container.sections) {
    console.error(`› ${container.idcc} container is empty`);
  }
  const [
    textedeBase,
    ...additionnalSections
  ] = container.sections.filter(({ etat }) => etat.startsWith("VIGUEUR"));

  const pAdditionnalSections = additionnalSections.map(async mainSection => {
    const pSections = mainSection.sections.map(text =>
      queue.add(() => getKaliText(text.id))
    );
    mainSection.sections = await Promise.all(pSections);
    return mainSection;
  });
  const sectionsWithText = await Promise.all(pAdditionnalSections);
  container.sections = [textedeBase, ...sectionsWithText];
  return container;
}

async function saveFile(container) {
  await writeFile(
    path.join(__dirname, "raw", `${container.idcc}.json`),
    JSON.stringify(container, 0, 2)
  );
}

function toFix(value, nb = 2) {
  const digit = Math.pow(10, nb);
  return Math.round(value * digit) / digit;
}

main().catch(console.error);
