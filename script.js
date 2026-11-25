// Forteller stilarket at JavaScript virker, slik at inntoningen kan slås på.
// (Uten JavaScript vises alt med en gang, så ingenting blir borte.)
document.documentElement.classList.add("js");

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

// F.eks. "Uten tittel XII · 2023" (eller bare "2023" uten titler)
function kortNavn(i) {
  const t = tittel(i);
  return t ? t + " · " + VERK[i].aar : String(VERK[i].aar);
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
//  GALLERIET – rader som fylles etter maleriets størrelse
// =========================================================
const galleri = document.querySelector(".galleri");

// Lag alle verkene én gang. Senere flyttes de bare mellom rader.
const verkElementer = VERK.map((_, i) => {
  const ramme = document.createElement("figure");
  ramme.className = "galleri-verk vis-ved-rulling";

  const knapp = document.createElement("button");
  knapp.type = "button";
  knapp.className = "galleri-knapp";
  knapp.setAttribute("aria-label", "Se " + kortNavn(i) + " i stort format");
  knapp.append(lagLerret(i, false));
  knapp.addEventListener("click", () => apneVisning(i));

  const tekst = document.createElement("figcaption");
  tekst.className = "galleri-tekst";
  tekst.textContent = kortNavn(i);

  ramme.append(knapp, tekst);
  return ramme;
});

let forrigeBredde = 0;

function leggUtGalleri() {
  const bredde = galleri.clientWidth;
  if (bredde === forrigeBredde || bredde === 0) return;
  forrigeBredde = bredde;

  // Hvor bred den tenkte galleriveggen er (i cm) – smalere på mobil
  const veggCm = bredde < 560 ? 110 : bredde < 960 ? 180 : 260;
  const mellomromCm = bredde < 560 ? 10 : 20;
  const bredesteVerk = Math.max(...VERK.map((v) => v.bredde));
  const veggBredde = Math.max(veggCm, bredesteVerk);
  const pikslerPerCm = bredde / veggBredde;

  // Fyll en rad til veggen er full, og start så på en ny
  const rader = [];
  let rad = [];
  let brukt = 0;

  VERK.forEach((verk, i) => {
    const trengs = (rad.length ? mellomromCm : 0) + verk.bredde;
    if (rad.length && brukt + trengs > veggBredde) {
      rader.push(rad);
      rad = [];
      brukt = 0;
    }
    brukt += (rad.length ? mellomromCm : 0) + verk.bredde;
    rad.push(i);
  });
  if (rad.length) rader.push(rad);

  // Heng opp maleriene i riktig størrelse
  const nyeRader = document.createDocumentFragment();
  rader.forEach((radenesVerk) => {
    const radElement = document.createElement("div");
    radElement.className = "galleri-rad";
    radElement.style.gap = mellomromCm * pikslerPerCm + "px";

    radenesVerk.forEach((i, plass) => {
      const element = verkElementer[i];
      element.style.width = VERK[i].bredde * pikslerPerCm + "px";
      element.style.height = VERK[i].hoyde * pikslerPerCm + "px";
      element.style.transitionDelay = plass * 0.12 + "s"; // tones inn ett og ett
      radElement.append(element);
    });

    nyeRader.append(radElement);
  });

  galleri.replaceChildren(nyeRader);
}

leggUtGalleri();
new ResizeObserver(leggUtGalleri).observe(galleri);

// =========================================================
//  STORT FORMAT – når man klikker på et maleri
// =========================================================
const visning = document.querySelector(".visning");
const visningBilde = visning.querySelector(".visning-bilde");
const visningNummer = visning.querySelector(".nummer");
const visningTittel = visning.querySelector(".lapp-tittel");
const visningDetaljer = visning.querySelector(".lapp-detaljer");
let aktivtVerk = 0;

function visVerk(i) {
  aktivtVerk = (i + VERK.length) % VERK.length; // går rundt fra siste til første
  const verk = VERK[aktivtVerk];

  visningBilde.style.setProperty("--forhold", verk.bredde / verk.hoyde);
  visningBilde.replaceChildren(lagLerret(aktivtVerk, true));

  visningNummer.textContent = String(aktivtVerk + 1).padStart(2, "0") + " / " + VERK.length;

  const t = tittel(aktivtVerk);
  visningTittel.innerHTML = t ? `<em>${t}</em>, ${verk.aar}` : String(verk.aar);
  visningDetaljer.innerHTML = `${verk.teknikk}<br>${verk.hoyde} × ${verk.bredde} cm`;
}

function apneVisning(i) {
  visVerk(i);
  visning.showModal();
}

visning.querySelector(".visning-lukk").addEventListener("click", () => visning.close());
visning.querySelector(".visning-forrige").addEventListener("click", () => visVerk(aktivtVerk - 1));
visning.querySelector(".visning-neste").addEventListener("click", () => visVerk(aktivtVerk + 1));

// Klikk på den tomme veggen rundt maleriet lukker
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

// =========================================================
//  ROLIG INNTONING NÅR TING KOMMER INN PÅ SKJERMEN
// =========================================================
const observator = new IntersectionObserver(
  (oppforinger) => {
    oppforinger.forEach((oppforing) => {
      if (oppforing.isIntersecting) {
        oppforing.target.classList.add("synlig");
        observator.unobserve(oppforing.target); // vis bare én gang
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".vis-ved-rulling").forEach((el) => observator.observe(el));

// =========================================================
//  MENYEN BLIR SLANKERE NÅR MAN HAR RULLET FORBI TOPPEN
// =========================================================
const meny = document.querySelector(".toppmeny");

function oppdaterMeny() {
  meny.classList.toggle("rullet", window.scrollY > 60);
}

window.addEventListener("scroll", oppdaterMeny, { passive: true });
oppdaterMeny();
