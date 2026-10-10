// Gera src/data/countries.json e public/flags/<código>.png a partir de dados abertos.
// Países: github.com/mledoze/countries (ODbL). Capitais em português: Wikidata (CC0).
// Nomes dos países em português do Brasil: Intl (CLDR). Bandeiras: flagcdn.com.
// Nomes e capitais ficam em português e inglês; o jogo escolhe pelo idioma do jogador.
// Uso: npm run snapshot
import { access, mkdir, writeFile } from "node:fs/promises";

const SOURCE = "https://cdn.jsdelivr.net/gh/mledoze/countries@master/countries.json";
const OUT = new URL("../src/data/countries.json", import.meta.url);
const FLAGS = new URL("../public/flags/", import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const raw = await (await fetch(SOURCE)).json();

// Capitais com rótulo em português (pt-br, senão pt), indexadas pelo nome em inglês.
const SPARQL = `SELECT ?iso ?en ?pt ?ptbr WHERE {
  ?c wdt:P297 ?iso; wdt:P36 ?cap.
  ?cap rdfs:label ?en FILTER(lang(?en) = "en")
  OPTIONAL { ?cap rdfs:label ?pt FILTER(lang(?pt) = "pt") }
  OPTIONAL { ?cap rdfs:label ?ptbr FILTER(lang(?ptbr) = "pt-br") }
}`;
const wikidata = await (
  await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(SPARQL)}`, {
    headers: { Accept: "application/sparql-results+json", "User-Agent": "country-quiz-snapshot/1.0 (github.com/oliveiraD4vi/country-quiz)" },
  })
).json();
const capitals = new Map(); // "BR" -> [{ en, pt }]
for (const b of wikidata.results.bindings) {
  const list = capitals.get(b.iso.value) ?? [];
  list.push({ en: b.en.value, pt: b.ptbr?.value ?? b.pt?.value ?? b.en.value });
  capitals.set(b.iso.value, list);
}
function capitalPt(cca2, english) {
  if (!english) return null;
  const list = capitals.get(cca2) ?? [];
  const match = list.find((c) => c.en === english) ?? (list.length === 1 ? list[0] : null);
  return match?.pt ?? english;
}

const regionNames = new Intl.DisplayNames("pt-BR", { type: "region" });
// Nomes do CLDR que soam estranhos num quiz.
const NAME_PT = { CD: "República Democrática do Congo", CG: "República do Congo", HK: "Hong Kong", MO: "Macau", MM: "Mianmar" };
function namePt(c) {
  if (NAME_PT[c.cca2]) return NAME_PT[c.cca2];
  const name = regionNames.of(c.cca2);
  return name && name !== c.cca2 ? name : (c.translations?.por?.common ?? c.name.common);
}

const countries = raw
  .map((c) => ({
    code: c.cca2.toLowerCase(),
    cca3: c.cca3,
    name: { pt: namePt(c), en: c.name.common },
    capital: c.capital?.[0] ? { pt: capitalPt(c.cca2, c.capital[0]), en: c.capital[0] } : null,
    region: c.region,
    subregion: c.subregion ?? "",
    area: Math.round(c.area ?? 0),
    borders: c.borders ?? [],
    currencies: Object.keys(c.currencies ?? {}),
    languages: Object.keys(c.languages ?? {}),
    un: Boolean(c.unMember),
  }))
  .sort((a, b) => a.name.pt.localeCompare(b.name.pt, "pt-BR"));

await writeFile(OUT, JSON.stringify(countries));
console.log(`países: ${countries.length}`);

await mkdir(FLAGS, { recursive: true });
let done = 0;
for (const c of countries) {
  const file = new URL(`${c.code}.png`, FLAGS);
  if (await access(file).then(() => true, () => false)) {
    done++;
    continue;
  }
  const res = await fetch(`https://flagcdn.com/w320/${c.code}.png`);
  if (!res.ok) {
    console.warn(`\nsem bandeira: ${c.code} (${res.status})`);
    continue;
  }
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  process.stdout.write(`\rbandeiras: ${++done}/${countries.length}`);
  await sleep(80);
}
console.log("\nok");
