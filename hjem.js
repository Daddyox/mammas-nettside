// =========================================================
//  SE I DITT HJEM
//  Besøkende tar et bilde av sin egen vegg og "henger opp"
//  ett eller flere malerier i riktig størrelse.
//
//  Bildet blir på besøkerens egen enhet – det lastes ikke opp
//  noe sted. (URL.createObjectURL lager bare en lokal lenke.)
// =========================================================
const hjem = document.querySelector(".hjem");
const hjemStart = hjem.querySelector(".hjem-start");
const hjemArbeid = hjem.querySelector(".hjem-arbeid");
const scene = hjem.querySelector(".hjem-scene");
const romBilde = scene.querySelector(".hjem-rom");
const maleSvg = scene.querySelector(".hjem-malelinje");
const maleStrek = maleSvg.querySelector("line");
const handtak = scene.querySelectorAll(".hjem-handtak");
const maleLapp = scene.querySelector(".hjem-malelapp");
const filvelger = hjem.querySelector("#hjem-fil");
const verkInfo = hjem.querySelector(".hjem-verkinfo");
const tips = hjem.querySelector(".hjem-tips");
const leggTilKnapp = hjem.querySelector(".hjem-legg-til");
const fjernKnapp = hjem.querySelector(".hjem-fjern");
const maleKnapp = hjem.querySelector(".hjem-mal");
const malePanel = hjem.querySelector(".hjem-malepanel");
const maleCm = hjem.querySelector("#hjem-cm");

const AVSTAND_CM = 15;                    // luft mellom malerier som henger ved siden av hverandre

// Maleriene som henger på veggen: hvilket verk, og midtpunktet som andel av bildet
let henger = [];
let valgt = 0;                            // hvilket av dem som er valgt (pilene bytter dette)
let cmPerBredde = 350;                    // hvor mange cm hele bildet er i bredden
let romForhold = 1.6;                     // bildets bredde / høyde
let maleLinje = { a: { x: 0.35, y: 0.7 }, b: { x: 0.65, y: 0.7 } };
let egetBilde = null;                     // lokal lenke til besøkerens bilde
let grunnTips = "";

const klem = (tall) => Math.min(1, Math.max(0, tall));
const breddeAndel = (i) => VERK[i].bredde / cmPerBredde;

// ----- Åpne / starte -----
function apneHjem(i) {
  henger = [{ i, x: 0.5, y: 0.4 }];
  valgt = 0;
  hjemStart.hidden = false;
  hjemArbeid.hidden = true;
  hjem.showModal();
}

function lastRom(lenke, cm, startY, tipsTekst) {
  romBilde.onload = () => {
    romForhold = romBilde.naturalWidth / romBilde.naturalHeight;
    scene.style.setProperty("--rom-forhold", romForhold);
    cmPerBredde = cm;
    grunnTips = tipsTekst;
    stillOppPaRad(startY);
    settMaling(false);
    lukkVelger();
    hjemStart.hidden = true;
    hjemArbeid.hidden = false;
    tegnAlle();
  };
  romBilde.src = lenke;
}

// Henger alle maleriene på én rad, midt på veggen, med litt luft mellom
function stillOppPaRad(y) {
  const luft = AVSTAND_CM / cmPerBredde;
  const total = henger.reduce((sum, h) => sum + breddeAndel(h.i), 0) + luft * (henger.length - 1);
  let x = 0.5 - total / 2;
  henger.forEach((h) => {
    const b = breddeAndel(h.i);
    h.x = klem(x + b / 2);
    h.y = y;
    x += b + luft;
  });
}

hjem.querySelector(".hjem-velg").addEventListener("click", () => filvelger.click());

filvelger.addEventListener("change", () => {
  const fil = filvelger.files[0];
  if (!fil) return;
  if (egetBilde) URL.revokeObjectURL(egetBilde);
  egetBilde = URL.createObjectURL(fil);
  lastRom(egetBilde, 350, 0.4,
    "Dra maleriet dit du vil ha det. Størrelsen er et anslag. Trykk «Mål opp» for å gjøre den nøyaktig.");
  filvelger.value = ""; // slik at samme bilde kan velges igjen
});

hjem.querySelector(".hjem-eksempel").addEventListener("click", () => {
  lastRom(eksempelrom(), 533, 0.3, "Dra maleriet dit du vil ha det. Sofaen i rommet er 220 cm bred.");
});

hjem.querySelector(".hjem-nytt").addEventListener("click", () => {
  hjemStart.hidden = false;
  hjemArbeid.hidden = true;
});

hjem.querySelector(".hjem-lukk").addEventListener("click", () => hjem.close());

// ----- Maleriene på veggen -----
function lagVerkElement(h, nr) {
  const el = document.createElement("div");
  el.className = "hjem-verk";
  el.tabIndex = 0;
  el.setAttribute("aria-label", kortNavn(h.i) + ". Dra det dit du vil, eller bruk piltastene.");
  const malLapp = document.createElement("span");
  malLapp.className = "hjem-verk-mal";
  malLapp.setAttribute("aria-hidden", "true");
  malLapp.textContent = `${VERK[h.i].hoyde} × ${VERK[h.i].bredde} cm`;
  el.append(lagLerret(h.i, true), malLapp);
  el.style.width = breddeAndel(h.i) * 100 + "%";
  el.style.aspectRatio = VERK[h.i].bredde / VERK[h.i].hoyde;
  el.style.left = h.x * 100 + "%";
  el.style.top = h.y * 100 + "%";

  // Ta tak i maleriet: velg det, og husk hvor man tok tak så det ikke "hopper"
  gjorDragbar(
    el,
    (p) => {
      velg(nr);
      return { dx: p.x - h.x, dy: p.y - h.y };
    },
    (p, start) => {
      h.x = klem(p.x - start.dx);
      h.y = klem(p.y - start.dy);
      el.style.left = h.x * 100 + "%";
      el.style.top = h.y * 100 + "%";
    }
  );

  el.addEventListener("focus", () => velg(nr));

  // Piltastene flytter maleriet (for de som bruker tastatur)
  el.addEventListener("keydown", (t) => {
    const steg = t.shiftKey ? 0.05 : 0.01;
    const flytt = { ArrowLeft: [-steg, 0], ArrowRight: [steg, 0], ArrowUp: [0, -steg], ArrowDown: [0, steg] }[t.key];
    if (!flytt) return;
    t.preventDefault();
    h.x = klem(h.x + flytt[0]);
    h.y = klem(h.y + flytt[1]);
    el.style.left = h.x * 100 + "%";
    el.style.top = h.y * 100 + "%";
  });

  return el;
}

// Tegner alle maleriene på nytt (oppmålingslinjen ligger alltid øverst)
function tegnAlle() {
  scene.querySelectorAll(".hjem-verk").forEach((el) => el.remove());
  henger.forEach((h, nr) => maleSvg.before(lagVerkElement(h, nr)));
  oppdaterValgt();
}

function velg(nr) {
  if (nr === valgt) return;
  valgt = nr;
  oppdaterValgt();
}

function oppdaterValgt() {
  const flere = henger.length > 1;
  scene.classList.toggle("flere", flere);
  scene.querySelectorAll(".hjem-verk").forEach((el, nr) => el.classList.toggle("valgt", nr === valgt));

  const h = henger[valgt];
  const verk = VERK[h.i];
  verkInfo.textContent = `${kortNavn(h.i)}, ${verk.hoyde} × ${verk.bredde} cm`;
  fjernKnapp.hidden = !flere;
  tips.textContent = flere
    ? `${henger.length} malerier på veggen. Klikk på et maleri for å velge det, og bruk pilene for å bytte det ut.`
    : grunnTips;
}

// Pilene bytter ut det valgte maleriet med forrige/neste verk
function byttVerk(steg) {
  const h = henger[valgt];
  h.i = (h.i + steg + VERK.length) % VERK.length;
  tegnAlle();
}

hjem.querySelector(".hjem-forrige").addEventListener("click", () => byttVerk(-1));
hjem.querySelector(".hjem-neste").addEventListener("click", () => byttVerk(1));

// ----- Velgeren: se maleriet før det henges opp -----
const velger = hjem.querySelector(".hjem-velger");
const velgerListe = velger.querySelector(".hjem-velger-liste");
const velgerBilde = velger.querySelector(".hjem-velger-bilde");
const velgerInfo = velger.querySelector(".hjem-velger-info");
let kandidat = 0;          // maleriet som vises i velgeren nå
let velgerKnapper = [];

// Små bilder av alle maleriene – lages første gang velgeren åpnes
function byggVelger() {
  velgerKnapper = VERK.map((verk, i) => {
    const knapp = document.createElement("button");
    knapp.type = "button";
    knapp.className = "hjem-velger-rute";
    knapp.setAttribute("role", "option");
    knapp.setAttribute("aria-label", `${kortNavn(i)}, ${verk.hoyde} × ${verk.bredde} cm`);
    knapp.style.aspectRatio = verk.bredde / verk.hoyde;
    knapp.append(lagLerret(i, false));
    knapp.addEventListener("click", () => visKandidat(i));
    knapp.addEventListener("dblclick", hengOppKandidat); // dobbeltklikk henger rett opp
    return knapp;
  });
  velgerListe.replaceChildren(...velgerKnapper);
}

function visKandidat(i) {
  kandidat = i;
  const verk = VERK[i];
  velgerBilde.style.setProperty("--forhold", verk.bredde / verk.hoyde);
  velgerBilde.replaceChildren(lagLerret(i, true));
  const paVeggen = henger.some((h) => h.i === i);
  velgerInfo.innerHTML =
    `<span class="hjem-velger-tittel">${kortNavn(i)}</span>` +
    `<span>${verk.teknikk}</span><span>${verk.hoyde} × ${verk.bredde} cm</span>` +
    (paVeggen ? `<span class="hjem-velger-merknad">Henger allerede på veggen</span>` : "");
  velgerKnapper.forEach((k, nr) => {
    k.classList.toggle("valgt", nr === i);
    k.setAttribute("aria-selected", nr === i);
  });
}

function apneVelger() {
  if (velgerKnapper.length === 0) byggVelger();
  settMaling(false);
  velger.hidden = false;
  leggTilKnapp.hidden = true;
  visKandidat((henger[valgt].i + 1) % VERK.length); // foreslår neste maleri
  velgerKnapper[kandidat].scrollIntoView({ block: "nearest" });
  velger.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function lukkVelger() {
  velger.hidden = true;
  leggTilKnapp.hidden = false;
}

// Heng kandidaten ved siden av det valgte maleriet, med litt luft imellom
function hengOppKandidat() {
  const forrige = henger[valgt];
  const i = kandidat;
  const halvt = (breddeAndel(forrige.i) + breddeAndel(i)) / 2 + AVSTAND_CM / cmPerBredde;
  let x = forrige.x + halvt;
  if (x + breddeAndel(i) / 2 > 1) x = forrige.x - halvt; // ikke plass til høyre – heng det til venstre
  henger.push({ i, x: klem(x), y: forrige.y });
  valgt = henger.length - 1;
  lukkVelger();
  tegnAlle();
}

leggTilKnapp.addEventListener("click", apneVelger);
velger.querySelector(".hjem-heng").addEventListener("click", hengOppKandidat);
velger.querySelector(".hjem-avbryt").addEventListener("click", lukkVelger);

// Ta ned det valgte maleriet
fjernKnapp.addEventListener("click", () => {
  if (henger.length < 2) return;
  henger.splice(valgt, 1);
  valgt = Math.min(valgt, henger.length - 1);
  tegnAlle();
});

// ----- Dra med mus eller finger -----
function punktIScenen(hendelse) {
  const r = scene.getBoundingClientRect();
  return { x: (hendelse.clientX - r.left) / r.width, y: (hendelse.clientY - r.top) / r.height };
}

function gjorDragbar(element, vedStart, vedFlytt) {
  element.addEventListener("pointerdown", (hendelse) => {
    hendelse.preventDefault();
    element.setPointerCapture(hendelse.pointerId);
    element.classList.add("drar");
    const start = vedStart(punktIScenen(hendelse));

    const flytt = (h) => vedFlytt(punktIScenen(h), start);
    const slipp = () => {
      element.removeEventListener("pointermove", flytt);
      element.removeEventListener("pointerup", slipp);
      element.removeEventListener("pointercancel", slipp);
      element.classList.remove("drar");
    };
    element.addEventListener("pointermove", flytt);
    element.addEventListener("pointerup", slipp);
    element.addEventListener("pointercancel", slipp);
  });
}

// ----- Oppmåling: gjør størrelsen nøyaktig -----
function tegnMaleLinje() {
  maleStrek.setAttribute("x1", maleLinje.a.x * 100);
  maleStrek.setAttribute("y1", maleLinje.a.y * 100);
  maleStrek.setAttribute("x2", maleLinje.b.x * 100);
  maleStrek.setAttribute("y2", maleLinje.b.y * 100);
  handtak.forEach((h) => {
    const ende = maleLinje[h.dataset.ende];
    h.style.left = ende.x * 100 + "%";
    h.style.top = ende.y * 100 + "%";
  });

  // Lengden i cm midt på streken, regnet ut fra størrelsen rommet har nå
  const dx = maleLinje.b.x - maleLinje.a.x;
  const dy = (maleLinje.b.y - maleLinje.a.y) / romForhold;
  const cm = Math.round(Math.hypot(dx, dy) * cmPerBredde);
  maleLapp.textContent = cm + " cm";
  maleLapp.style.left = ((maleLinje.a.x + maleLinje.b.x) / 2) * 100 + "%";
  maleLapp.style.top = ((maleLinje.a.y + maleLinje.b.y) / 2) * 100 + "%";
}

handtak.forEach((h) => {
  gjorDragbar(h, () => null, (p) => {
    maleLinje[h.dataset.ende] = { x: klem(p.x), y: klem(p.y) };
    tegnMaleLinje();
  });
});

function settMaling(pa) {
  if (pa) lukkVelger();
  scene.classList.toggle("maler", pa);
  malePanel.hidden = !pa;
  maleKnapp.textContent = pa ? "Avbryt oppmåling" : "Mål opp for riktig størrelse";
  if (pa) tegnMaleLinje();
}

maleKnapp.addEventListener("click", () => settMaling(!scene.classList.contains("maler")));

function brukMal() {
  const cm = parseFloat(maleCm.value.replace(",", "."));
  if (!(cm > 0)) {
    maleCm.focus();
    return;
  }
  // Hvor lang linjen er, som andel av bildets bredde
  const dx = maleLinje.b.x - maleLinje.a.x;
  const dy = (maleLinje.b.y - maleLinje.a.y) / romForhold;
  const andel = Math.hypot(dx, dy);
  if (andel < 0.01) return; // prikkene ligger oppå hverandre

  cmPerBredde = cm / andel;
  grunnTips = "Nå har maleriet riktig størrelse. Dra det dit du vil ha det.";
  settMaling(false);
  tegnAlle();
}

hjem.querySelector(".hjem-bruk").addEventListener("click", brukMal);
maleCm.addEventListener("keydown", (h) => {
  if (h.key === "Enter") brukMal();
});

// ----- Knappen i visningen i stort format -----
document.querySelector(".hjem-apne").addEventListener("click", () => apneHjem(aktivtVerk));

// ----- Et enkelt eksempelrom, tegnet som SVG -----
// 1600 px bred; sofaen (med armlener) er 660 px = 220 cm  →  hele bildet ≈ 533 cm
function eksempelrom() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
    <defs>
      <linearGradient id="vegg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ece7df"/><stop offset="1" stop-color="#dcd5c9"/>
      </linearGradient>
      <radialGradient id="lys" cx="0.5" cy="0" r="0.8">
        <stop offset="0" stop-color="#fff" stop-opacity="0.6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="gulv" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#9d8466"/><stop offset="1" stop-color="#b59c7d"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="1000" fill="url(#vegg)"/>
    <rect width="1600" height="800" fill="url(#lys)"/>
    <rect y="800" width="1600" height="200" fill="url(#gulv)"/>
    <rect y="784" width="1600" height="18" fill="#f5f2ed"/>
    <ellipse cx="800" cy="802" rx="350" ry="14" fill="#000" opacity="0.12"/>
    <rect x="512" y="768" width="14" height="32" fill="#3b2f25"/>
    <rect x="1074" y="768" width="14" height="32" fill="#3b2f25"/>
    <rect x="500" y="560" width="600" height="110" rx="28" fill="#5d6b66"/>
    <rect x="480" y="640" width="640" height="128" rx="24" fill="#68776f"/>
    <rect x="470" y="600" width="72" height="172" rx="28" fill="#56635e"/>
    <rect x="1058" y="600" width="72" height="172" rx="28" fill="#56635e"/>
    <rect x="1215" y="660" width="130" height="12" fill="#6b5340"/>
    <rect x="1275" y="672" width="10" height="128" fill="#6b5340"/>
    <rect x="1277" y="610" width="6" height="50" fill="#6b5340"/>
    <path d="M1240 550 L1320 550 L1338 615 L1222 615 Z" fill="#f1e9da"/>
    <path d="M230 705 L330 705 L314 798 L246 798 Z" fill="#b5764f"/>
    <ellipse cx="250" cy="620" rx="34" ry="90" fill="#4f6b4a" transform="rotate(-22 250 620)"/>
    <ellipse cx="315" cy="610" rx="34" ry="95" fill="#5b7a55" transform="rotate(20 315 610)"/>
    <ellipse cx="282" cy="590" rx="30" ry="110" fill="#46613f"/>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
