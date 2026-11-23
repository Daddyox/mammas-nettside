// Forteller stilarket at JavaScript virker, slik at inntoningen kan slås på.
// (Uten JavaScript vises alt med en gang, så ingenting blir borte.)
document.documentElement.classList.add("js");

// ----- Rolig inntoning når ting kommer inn på skjermen -----
const elementer = document.querySelectorAll(".vis-ved-rulling");

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

elementer.forEach((el) => observator.observe(el));

// ----- Menyen får bakgrunn når man har rullet forbi toppen -----
const meny = document.querySelector(".toppmeny");

function oppdaterMeny() {
  meny.classList.toggle("rullet", window.scrollY > 60);
}

window.addEventListener("scroll", oppdaterMeny, { passive: true });
oppdaterMeny();
