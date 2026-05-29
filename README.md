# UnisAllRound

Prototipo mobile multipiattaforma realizzato con Expo e React Native a partire dai requisiti dei PDF del gruppo 3.

## Avvio su cellulare con QR code

1. Installa l’app **Expo Go** sul telefono da App Store o Play Store.
2. Collega computer e telefono alla stessa rete Wi-Fi.
3. Da questa cartella esegui:

```bash
npm run start:mobile
```

4. Scansiona il QR code mostrato dal terminale:
   - Android: dall’app Expo Go.
   - iPhone: dalla Fotocamera o da Expo Go.

Se telefono e computer non si vedono sulla stessa rete, usa:

```bash
npm run start:tunnel
```

## Account demo

Password demo: `demo`.

- Studente: `lucia.canzolino@studenti.unisa.it`
- Docente: `m.cucciniello@unisa.it`
- PTA: `a.purcaro@unisa.it`

La schermata iniziale contiene anche tre pulsanti rapidi per entrare direttamente con ciascun ruolo.

## Funzioni implementate

- Registrazione con selezione ruolo Studente, Docente o PTA.
- Login e sessione persistente locale.
- Home adattata al ruolo.
- Area Studente: carriera, CFU, media aritmetica, media ponderata, avanzamento, orari, esiti, collegamenti e-learning/biblioteca.
- Area Docente: corsi, aule, pubblicazione esiti, comunicazioni e ricevimento.
- Area PTA: orario di lavoro e gestione ticket.
- Servizi generici: news, notifiche, profilo, FAQ, mensa, CUS, meteo, mappa campus, trasporti, feedback e ticket.
- Ricerca interna dalla barra superiore.

## Comandi utili

```bash
npm run typecheck
npm run web
```
