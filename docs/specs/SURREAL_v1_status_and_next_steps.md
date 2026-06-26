# SURREAL EXP LAB — v1 Status & Next Steps

## 1. Kde jsme právě teď

Aktuální stav už není jen „cool web“. Je to funkční **spatial runtime prototype** s jasnou identitou a s dost stabilní kostrou pro další iterace.

### Co je už reálně hotové
- stabilní pinned spatial stage
- centrální artifact anchor
- orbit / scroll-based pohyb kamerou
- HUD overlay integrovaný do viewportu
- COLOR / IR spectrum mode napříč HUD, artefaktem a scénickým světlem
- oddělení runtime vrstvy, HUD vrstvy a scroll content vrstvy

### Co to znamená prakticky
Projekt už plní několik rolí zároveň:
- **SURREAL** — autorská identita a signature vibe
- **EXP** — experimentální spatial showcase
- **LAB** — skill proof a technologická laboratoř
- **FOLIO** — portfolio / prezentace práce

Jinými slovy: v1 už teď může fungovat jako veřejně použitelná roznětka, ne jen interní prototyp.

---

## 2. Co se včera skutečně podařilo

### HUD mise není jen kosmetika
Implementace HUD a jeho sladění s IR modem nebyla jen estetická úprava. Ve skutečnosti uzavřela důležitou část systému:

- HUD už není izolovaný overlay
- spectrum mode už není jen barevný gimmick
- scéna reaguje jako jeden celek

### Výsledek
- HUD reaguje na režim
- artefakt reaguje na režim
- fog a světla reagují na režim
- scéna působí jako jedna realita, ne jako slepenec efektů

To je velmi důležitý milestone pro Stage D — HUD orchestration direction. Debrief Stage C navíc potvrzuje, že po stabilizaci cinematic camera runtime je další logická vrstva právě HUD orchestrace a režimy chování. Stage D update prompt zároveň říká, že HUD má přejít z overlaye do runtime interface layer.

---

## 3. Co ještě NEZNAMENÁ „template kit complete"

Dokončený HUD neznamená dokončený template.

Tohle jsou oblasti, které ještě stále patří do produkčního plánu:

### A. HUD orchestration dokončit doopravdy
Aktuálně je hotový vizuální základ a spectrum napojení.
Ještě chybí plná Stage D logika:
- HUD state mapper nad engine snapshotem
- idle / hover / active / CTA / gateway states
- sector-aware nav highlight
- microcopy rhythm
- CTA behavior layer

### B. Sound behavior layer
Tohle je podle všeho důležitá součást tvého světa, ne bonus navíc.
Minimální roadmapa:
- v1.1: ambient drone + optional audio enable
- v1.2: CTA harmonic transition
- v2: distance-based audio response
- v3: scroll / state tuned signal behavior

### C. Environment / hero effects layer
Ne „shader pro shader“, ale **environment vrstva pro HERO objekt**.
Sem patří:
- velmi lehký atmospheric environment pass
- jemné volumetrické / glow iluze bez výkonnostního masakru
- případné overlays / scan vrstvy jen pokud podporují svět, ne když ho přehluší

### D. Projects system
Pro portfolio v1:
- prostorový carousel projektů okolo artefaktu
- focus node + HUD popis
- klik → externí projekt / stránka

Pro v2:
- mini showcase / vitrína projektu

Pro v3:
- project portals / mini worlds

### E. CTA dramaturgie
CTA má být víc než formulář.
Má působit jako:
- signal response
- invitation to contact
- aktivní bod komunikace

### F. Gateway layer
Tohle je pravděpodobně v1+ až v2 věc, ale je dobré s tím počítat architektonicky už teď.

### G. Performance discipline
Spatial web umře, když spadne FPS nebo začne být přeeffektovaný.
To znamená držet:
- nízký počet objektů
- lehké particles
- uměřený bloom / FX
- disciplínu shaderů
- fallbacky

---

## 4. Doporučený produkční plán od teď dál

## PHASE 1 — Stabilizace po HUD + IR milníku
Cíl: uzamknout funkční checkpoint.

Checklist:
- commitnout současný stabilní stav
- udělat milestone screenshoty COLOR / IR
- krátký debrief tohoto milníku

## PHASE 2 — HUD State Completion
Cíl: dokončit Stage D1 a část D2.

Priority:
1. HUD signal state mapper
2. nav focus / sector highlight
3. CTA trigger logika
4. fade / idle rytmus

## PHASE 3 — Sound Behaviors
Cíl: přidat zvuk jako behaviorální vrstvu světa.

Priority:
1. opt-in audio enable v HUD
2. base drone ambience
3. CTA harmonic transition
4. později distance / pitch behavior

## PHASE 4 — Project Ring / Carousel
Cíl: portfolio v1 přestane být jen sekce a začne být spatial portfolio.

Priority:
1. orbiting project nodes
2. focus state
3. HUD project metadata
4. click-through na projekt

## PHASE 5 — Environment FX Layer
Cíl: dodat hero světu jemnou atmosférickou hloubku bez výkonnostního pádu.

Priority:
1. lightweight environment pass
2. jemný background motion / signal ambience
3. overlays jen pokud slouží světu

## PHASE 6 — CTA Scene Upgrade
Cíl: kontakt jako spatial moment.

## PHASE 7 — Gateway Prototype
Cíl: první portálový moment pro v1.x / v2.

---

## 5. Doporučené pravidlo scope

### Co je v1
- stabilní svět
- silný artifact + HUD + IR mode
- základní navigace
- první portfolio carousel
- jednoduché CTA

### Co není nutné rvát do v1
- plné mini světy projektů
- komplexní transformace reality
- heavy shader systém
- přehnané overlays
- komplikovaný audio engine

Jinými slovy:
**v1 = roznětka, ne atomovka**.

---

## 6. Nezapomenout

Tvoje největší síla teď není v tom, kolik efektů přidáš.
Tvoje síla je v tom, že už máš:
- jazyk světa
- architekturu světa
- centrum světa
- dramaturgii světa

To je mnohem cennější než dalších deset vizuálních triků.
