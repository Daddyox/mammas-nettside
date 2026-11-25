// =========================================================
//  TITLER OG TEKST TIL HVERT VERK
// =========================================================
function romertall(tall) {
  const tegn = [[50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let tekst = "";
  for (const [verdi, bokstaver] of tegn) {
    while (tall >= verdi) {
      tekst += bokstaver;
      tall -= verdi;
    }
  }
  return tekst;
}

function tittel(i) {
  if (TITTELTYPE === "nummer") return "Nr. " + (i + 1);
  if (TITTELTYPE === "ingen") return "";
  return "Uten tittel " + romertall(i + 1);
}

// Brukes som beskrivelse for skjermlesere, f.eks. "Uten tittel XII, 2023"
function kortNavn(i) {
  const t = tittel(i);
  return t ? t + ", " + VERK[i].aar : String(VERK[i].aar);
}

// Linjene under maleriet: år, teknikk, mål – og pris eller "Solgt" hvis det er fylt inn
function detaljLinjer(verk) {
  const linjer = [
    `<span>${verk.aar}</span>`,
    `<span>${verk.teknikk}</span>`,
    `<span>${verk.hoyde} × ${verk.bredde} cm</span>`,
  ];
  if (verk.solgt) {
    linjer.push(`<span class="verk-pris verk-solgt">Solgt</span>`);
  } else if (verk.pris) {
    linjer.push(`<span class="verk-pris">kr ${verk.pris.toLocaleString("nb-NO")}</span>`);
  }
  return linjer.join("");
}

// =========================================================
//  MALERIET – ekte bilde, eller en abstrakt plassholder
// =========================================================
const plassholderFarger = ["#233c82", "#9c2430", "#cf9439", "#5f6136", "#d6aaa1", "#161d2b", "#e6e2da"];

function plassholder(i) {
  const farge = (k) => plassholderFarger[(i * 3 + k * 5) % plassholderFarger.length];
  const x = 20 + ((i * 37) % 60);
  const y = 20 + ((i * 53) % 60);
  const vinkel = (i * 47) % 360;
  return `radial-gradient(circle at ${x}% ${y}%, ${farge(0)} 0 14%, transparent 42%),
          radial-gradient(ellipse at ${100 - x}% ${100 - y}%, ${farge(1)} 0 10%, transparent 50%),
          linear-gradient(${vinkel}deg, ${farge(2)}, ${farge(3)})`;
}

function lagLerret(i, lastStraks) {
  const verk = VERK[i];
  const beskrivelse = "Abstrakt maleri av Oloey, " + kortNavn(i);

  if (verk.fil) {
    const bilde = document.createElement("img");
    bilde.className = "lerret";
    bilde.src = "bilder/" + verk.fil;
    bilde.alt = beskrivelse;
    bilde.loading = lastStraks ? "eager" : "lazy";
    bilde.decoding = "async";
    return bilde;
  }

  const flate = document.createElement("div");
  flate.className = "lerret";
  flate.style.background = plassholder(i);
  flate.setAttribute("role", "img");
  flate.setAttribute("aria-label", "Plassholder: " + beskrivelse);
  return flate;
}

// =========================================================
//  GALLERIET – kolonner der hvert maleri beholder sin form
// =========================================================
const galleri = document.querySelector(".galleri");
document.querySelector(".verk-antall").textContent = VERK.length + " verk";

// Lag hvert "kort" (maleri + tekst under) én gang. Senere flyttes de bare mellom kolonner.
const verkKort = VERK.map((verk, i) => {
  const kort = document.createElement("figure");
  kort.className = "verk-kort";

  const knapp = document.createElement("button");
  knapp.type = "button";
  knapp.className = "verk-knapp";
  knapp.setAttribute("aria-label", "Se " + kortNavn(i) + " i stort format");
  const lerret = lagLerret(i, false);
  lerret.style.aspectRatio = verk.bredde + " / " + verk.hoyde;
  knapp.append(lerret);
  knapp.addEventListener("click", () => apneVisning(i));

  const tekst = document.createElement("figcaption");
  tekst.className = "verk-tekst";
  const t = tittel(i);
  tekst.innerHTML = (t ? `<span class="verk-tittel">${t}</span>` : "") + detaljLinjer(verk);

  kort.append(knapp, tekst);
  return kort;
});

let forrigeAntallKolonner = 0;

function leggUtGalleri() {
  const bredde = galleri.clientWidth;
  if (bredde === 0) return;
  const antall = bredde >= 1100 ? 4 : bredde >= 700 ? 3 : 2;
  if (antall === forrigeAntallKolonner) return;
  forrigeAntallKolonner = antall;

  const kolonner = Array.from({ length: antall }, () => {
    const kolonne = document.createElement("div");
    kolonne.className = "galleri-kolonne";
    return kolonne;
  });

  // Legg hvert maleri i den kolonnen som er kortest så langt,
  // slik at kolonnene blir omtrent like lange.
  const hoyder = new Array(antall).fill(0);
  VERK.forEach((verk, i) => {
    const kortest = hoyder.indexOf(Math.min(...hoyder));
    kolonner[kortest].append(verkKort[i]);
    hoyder[kortest] += verk.hoyde / verk.bredde + 0.5; // maleriet + teksten under
  });

  galleri.replaceChildren(...kolonner);
}

leggUtGalleri();
new ResizeObserver(leggUtGalleri).observe(galleri);

// =========================================================
//  STORT FORMAT – når man klikker på et maleri
// =========================================================
const visning = document.querySelector(".visning");
const visningBilde = visning.querySelector(".visning-bilde");
const visningNummer = visning.querySelector(".visning-nummer");
const visningTittel = visning.querySelector(".visning-tittel");
const visningDetaljer = visning.querySelector(".visning-detaljer");
let aktivtVerk = 0;

function visVerk(i) {
  aktivtVerk = (i + VERK.length) % VERK.length; // går rundt fra siste til første
  const verk = VERK[aktivtVerk];

  visningBilde.style.setProperty("--forhold", verk.bredde / verk.hoyde);
  visningBilde.replaceChildren(lagLerret(aktivtVerk, true));

  visningNummer.textContent = `${aktivtVerk + 1} av ${VERK.length}`;
  const t = tittel(aktivtVerk);
  visningTittel.textContent = t;
  visningTittel.hidden = !t;
  visningDetaljer.innerHTML = detaljLinjer(verk);
}

function apneVisning(i) {
  visVerk(i);
  visning.showModal();
}

visning.querySelector(".visning-lukk").addEventListener("click", () => visning.close());
visning.querySelector(".visning-forrige").addEventListener("click", () => visVerk(aktivtVerk - 1));
visning.querySelector(".visning-neste").addEventListener("click", () => visVerk(aktivtVerk + 1));

// Klikk på den tomme flaten rundt maleriet lukker
visning.addEventListener("click", (hendelse) => {
  if (hendelse.target === visning || hendelse.target.classList.contains("visning-innhold")) {
    visning.close();
  }
});

// Piltastene blar (Esc lukker av seg selv)
visning.addEventListener("keydown", (hendelse) => {
  if (hendelse.key === "ArrowLeft") visVerk(aktivtVerk - 1);
  if (hendelse.key === "ArrowRight") visVerk(aktivtVerk + 1);
});

// Sveip på mobil
let sveipStart = null;
visning.addEventListener("touchstart", (h) => { sveipStart = h.touches[0].clientX; }, { passive: true });
visning.addEventListener("touchend", (h) => {
  if (sveipStart === null) return;
  const avstand = h.changedTouches[0].clientX - sveipStart;
  if (Math.abs(avstand) > 50) visVerk(aktivtVerk + (avstand < 0 ? 1 : -1));
  sveipStart = null;
});
