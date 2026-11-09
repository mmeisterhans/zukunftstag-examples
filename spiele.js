"use strict";

const byId = (id) => document.getElementById(id);

// Fang das Ziel
const feld = byId("spielfeld");
const stern = byId("stern");
const punkteAnzeige = byId("punkte");
const zeitAnzeige = byId("zeit");
const fangStart = byId("fangen-start");
const fangMeldung = byId("fangen-meldung");
let punkte = 0;
let ende = 0;
let fangTimer;

function sternVerschieben() {
  const maxX = Math.max(0, feld.clientWidth - stern.offsetWidth);
  const maxY = Math.max(0, feld.clientHeight - stern.offsetHeight);
  stern.style.left = Math.floor(Math.random() * maxX) + "px";
  stern.style.top = Math.floor(Math.random() * maxY) + "px";
}

function fangZeitPruefen() {
  const rest = Math.max(0, Math.ceil((ende - performance.now()) / 1000));
  zeitAnzeige.textContent = rest;
  if (rest === 0) {
    clearInterval(fangTimer);
    stern.hidden = true;
    fangStart.disabled = false;
    fangStart.textContent = "Noch eine Runde";
    fangMeldung.textContent = "Zeit vorbei! Deine Punkte: " + punkte + ".";
  }
  return rest > 0;
}

fangStart.addEventListener("click", () => {
  punkte = 0;
  punkteAnzeige.textContent = punkte;
  ende = performance.now() + 30_000;
  fangMeldung.textContent = "Die Runde läuft.";
  stern.hidden = false;
  sternVerschieben();
  stern.focus();
  fangStart.disabled = true;
  fangZeitPruefen();
  fangTimer = setInterval(fangZeitPruefen, 100);
});

stern.addEventListener("click", () => {
  if (!fangZeitPruefen()) return;
  punkteAnzeige.textContent = ++punkte;
  sternVerschieben();
});

window.addEventListener("resize", () => {
  if (!stern.hidden) sternVerschieben();
});

// Warte auf Grün
const reaktionsfeld = byId("reaktionsfeld");
const reaktionMeldung = byId("reaktion-meldung");
let reaktion = "bereit";
let reaktionTimer;
let signalZeit = 0;

function reaktionBeenden(meldung) {
  clearTimeout(reaktionTimer);
  reaktion = "bereit";
  reaktionsfeld.className = "reaktionsfeld";
  reaktionsfeld.textContent = "Noch eine Runde";
  reaktionMeldung.textContent = meldung;
}

reaktionsfeld.addEventListener("click", () => {
  if (reaktion === "warten") {
    reaktionBeenden("Zu früh! Warte in der nächsten Runde auf «Los!».");
    return;
  }
  if (reaktion === "los") {
    const dauer = Math.round(performance.now() - signalZeit);
    reaktionBeenden("Deine Reaktionszeit: " + dauer + " Millisekunden.");
    return;
  }
  reaktion = "warten";
  reaktionMeldung.textContent = "";
  reaktionsfeld.className = "reaktionsfeld warten";
  reaktionsfeld.textContent = "Warte …";
  reaktionTimer = setTimeout(() => {
    reaktion = "los";
    signalZeit = performance.now();
    reaktionsfeld.className = "reaktionsfeld los";
    reaktionsfeld.textContent = "Los!";
  }, 1500 + Math.random() * 2500);
});

// Finde den Schatz
const kisten = [...document.querySelectorAll(".kiste")];
const schatzMeldung = byId("schatz-meldung");
let schatzIndex = 0;

function schatzVerstecken() {
  schatzIndex = Math.floor(Math.random() * kisten.length);
  kisten.forEach((kiste, index) => {
    kiste.disabled = false;
    kiste.classList.remove("gefunden");
    kiste.textContent = "Kiste " + (index + 1);
  });
  schatzMeldung.textContent = "Wähle eine Kiste.";
}

kisten.forEach((kiste, index) => {
  kiste.addEventListener("click", () => {
    kisten.forEach((andere) => { andere.disabled = true; });
    kisten[schatzIndex].classList.add("gefunden");
    kisten[schatzIndex].textContent = "Schatz in Kiste " + (schatzIndex + 1);
    schatzMeldung.textContent = index === schatzIndex
      ? "Gefunden! Du hast die richtige Kiste gewählt."
      : "Der Schatz war in Kiste " + (schatzIndex + 1) + ".";
  });
});
byId("schatz-neu").addEventListener("click", schatzVerstecken);
schatzVerstecken();
