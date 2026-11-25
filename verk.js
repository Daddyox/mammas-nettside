// =========================================================
//  ALLE VERKENE TIL OLOEY
//
//  Ett maleri per linje. Rekkefølgen her = rekkefølgen på siden.
//  Galleriet regner selv ut hvor mange som får plass på hver rad,
//  ut fra hvor brede maleriene er i virkeligheten.
//
//    fil      filnavnet i mappen "bilder", f.eks. "maleri-01.jpg"
//             ("" = vis en plassholder til bildet er klart)
//    hoyde    høyde i cm   ← kunstverdenen skriver alltid
//    bredde   bredde i cm     høyde × bredde
//    aar      årstall
//    teknikk  f.eks. "Olje på lerret"
//
//  Tips: Vil du at små malerier skal henge sammen på samme rad,
//  legg dem etter hverandre i listen.
// =========================================================

// Hvordan titlene skal vises (maleriene har bevisst ingen navn):
//   "uten-tittel"  →  Uten tittel XII
//   "nummer"       →  Nr. 12
//   "ingen"        →  bare årstall, teknikk og mål
const TITTELTYPE = "uten-tittel";

// BYTT UT: plassholdere – byttes med ekte mål, år og teknikk når bildene er tatt
const VERK = [
  { fil: "", hoyde: 130, bredde: 90,  aar: 2024, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 130, bredde: 90,  aar: 2024, teknikk: "Olje på lerret" },

  { fil: "", hoyde: 100, bredde: 80,  aar: 2023, teknikk: "Akryl på lerret" },
  { fil: "", hoyde: 100, bredde: 70,  aar: 2023, teknikk: "Akryl på lerret" },
  { fil: "", hoyde: 90,  bredde: 70,  aar: 2023, teknikk: "Blandteknikk på lerret" },

  { fil: "", hoyde: 25,  bredde: 25,  aar: 2022, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 25,  bredde: 25,  aar: 2022, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 25,  bredde: 25,  aar: 2022, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 25,  bredde: 25,  aar: 2022, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 30,  bredde: 30,  aar: 2022, teknikk: "Akryl på lerret" },
  { fil: "", hoyde: 30,  bredde: 30,  aar: 2022, teknikk: "Akryl på lerret" },

  { fil: "", hoyde: 120, bredde: 90,  aar: 2021, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 80,  bredde: 60,  aar: 2021, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 60,  bredde: 50,  aar: 2021, teknikk: "Akryl på lerret" },

  { fil: "", hoyde: 40,  bredde: 40,  aar: 2020, teknikk: "Akryl på lerret" },
  { fil: "", hoyde: 40,  bredde: 40,  aar: 2020, teknikk: "Akryl på lerret" },
  { fil: "", hoyde: 40,  bredde: 40,  aar: 2020, teknikk: "Akryl på lerret" },
  { fil: "", hoyde: 40,  bredde: 40,  aar: 2020, teknikk: "Akryl på lerret" },

  { fil: "", hoyde: 130, bredde: 90,  aar: 2019, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 110, bredde: 80,  aar: 2019, teknikk: "Blandteknikk på lerret" },
  { fil: "", hoyde: 50,  bredde: 40,  aar: 2019, teknikk: "Akryl på lerret" },

  { fil: "", hoyde: 70,  bredde: 50,  aar: 2018, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 70,  bredde: 50,  aar: 2018, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 70,  bredde: 50,  aar: 2018, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 60,  bredde: 50,  aar: 2018, teknikk: "Akryl på lerret" },

  { fil: "", hoyde: 100, bredde: 100, aar: 2017, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 100, bredde: 100, aar: 2017, teknikk: "Akryl på lerret" },

  { fil: "", hoyde: 80,  bredde: 60,  aar: 2016, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 80,  bredde: 60,  aar: 2016, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 60,  bredde: 50,  aar: 2016, teknikk: "Akryl på lerret" },
  { fil: "", hoyde: 30,  bredde: 30,  aar: 2016, teknikk: "Akryl på lerret" },

  { fil: "", hoyde: 130, bredde: 90,  aar: 2015, teknikk: "Olje på lerret" },
  { fil: "", hoyde: 120, bredde: 90,  aar: 2015, teknikk: "Olje på lerret" },

  { fil: "", hoyde: 40,  bredde: 30,  aar: 2015, teknikk: "Akryl på lerret" },
  { fil: "", hoyde: 40,  bredde: 30,  aar: 2015, teknikk: "Akryl på lerret" },
];
