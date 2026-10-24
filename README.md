# Bomberman 2 – Browser-Version

Nachfolger der Browser-Version von Bomberman (p5.js, HTML, CSS, JavaScript).
Der Ordner `bbm2/` ist komplett eigenständig und kann so wie er ist hochgeladen werden.

## Neu in Bomberman 2

### Balancing

Alle Werte stehen zentral in `js/items.js` (`BALANCE` und `ITEMS`).

- **Rollschuhe:** +0,35 statt +1 Pixel pro Frame, höchstens 5 Stück (2 → 3,75). Vorher war jeder Rollschuh +50 % Tempo und unbegrenzt.
- **Obergrenzen:** höchstens 8 Bomben und Reichweite 8.
- **Keine gestapelten Bomben** mehr auf demselben Feld.
- **Kettenreaktion:** Eine Bombe im Feuer einer anderen Explosion explodiert sofort.
- **Explosionen zerstören Items**, die offen auf dem Boden liegen.
- **Fairere Item-Verteilung:** Die Items werden für das Viertel oben links ausgelost und in die anderen drei Ecken gespiegelt.
  Jeder Spieler hat also dieselben Items in seiner Nähe.

### "?"-Boxen

Items stecken nur noch in Kisten mit einem **Fragezeichen** (ca. 30 % der Kisten). Normale Kisten sind leer.
Was in einer "?"-Box steckt, sieht man erst, wenn sie zerstört wird.

### Items

| Item | Wirkung |
| --- | --- |
| Bombe | +1 Bombe gleichzeitig |
| Feuer | +1 Reichweite |
| Rollschuh | etwas schneller |
| **Kick** (Stiefel) | Bomben wegkicken, indem man gegen sie läuft. Sie rutschen bis zur nächsten Wand, Bombe oder Spieler |
| **Schild** | 8 Sekunden unverwundbar (blauer Ring, blinkt kurz vor Ende) |
| **Herz** | +1 Leben (max. 3). Bei vollen Leben gibt es stattdessen einen Schild |
| **Totenkopf** | 10 Sekunden Fluch: SLOW, TURBO, REVERSE (Steuerung vertauscht), DIARRHEA (legt dauernd Bomben), NO BOMBS, SHORT FUSE, TINY FIRE. Wer einen anderen Spieler berührt, gibt den Fluch weiter |
| **Durchschlagsbombe** (rote Bombe) | Die Explosion geht durch Kisten hindurch |
| **Volles Feuer** | Reichweite sofort auf Maximum |

Beim Einsammeln erscheint kurz ein Text über dem Spieler. Kick und Durchschlagsbombe werden im HUD angezeigt.

Im Hauptmenü öffnet der Button **ITEMS** eine Übersicht aller Items und Totenkopf-Flüche
(zurück mit BACK oder ESC). Name und Beschreibung stehen pro Item in `js/items.js`.

### Sudden Death (HURRY UP)

- Oben rechts läuft ein Rundentimer, standardmäßig **2:00**.
  In den letzten 10 Sekunden blinkt er rot.
- Bei 0:00 erscheint **HURRY UP!**. Danach fallen Ring für Ring von außen nach innen Blöcke aufs Feld.
  Es fallen immer **4 gleichzeitig, einer pro Seite** (um 90° gedreht), damit jede Ecke gleich schnell in Gefahr ist.
- Ein Schatten zeigt 0,5 s vorher, wo ein Block landet. Wer getroffen wird, ist **sofort raus**, auch mit Schild.
  Bomben unter einem Block explodieren, Items und Kisten verschwinden.
- Frei bleibt nur das kleine Kreuz in der Mitte.
- Wer während Sudden Death stirbt und Leben übrig hat, erscheint auf einem freien Feld möglichst weit innen,
  weil die eigene Ecke schon zugemauert ist.
- Einstellbar in `js/items.js`: `roundTime`, `hurryUpTime`, `blockInterval`, `blockFallTime`.

### Pause (nur lokal)

- **ESC** oder **P** pausiert ein lokales Spiel, nochmal drücken setzt es fort. **Q** in der Pause führt zurück ins Menü.
- In der Pause steht alles still: Bomben, Respawn-Schutz, Flüche und der HURRY-UP-Timer.
- Wechselt man in einem lokalen Spiel in einen anderen Tab oder ein anderes Fenster, pausiert das Spiel automatisch.
- Online gibt es keine Pause, weil alle Browser dieselben Frames simulieren müssen.
- Ist ESC oder P als Bomben-Taste belegt, legt die Taste weiter Bomben, pausiert dann aber nicht.

### Neue Grafik und Animationen

- **Spielfeld:** Gras im Schachbrettmuster, 3D-Steinsäulen, Ziegelkisten mit Vorderseite und ein dunkler Steinrand.
  Säulen und Kisten werfen Schatten nach unten rechts. Erzeugt als Pixel-Art (`sprites/tile-*.png`).
- **Figuren:** komplett neue Sprites mit allen Animationen in `sprites/bomber1-4.png` (eine Animation pro Zeile, 32×40 pro Bild):
  - Laufen und Stehen (mit Atmen) in 4 Richtungen und ein Schatten unter den Füßen
  - **Idle** nach 4 Sekunden Stillstand (umschauen, blinzeln, strecken)
  - **Benommen** mit kreisenden Sternen, solange ein Totenkopf-Fluch wirkt
  - **Schild-Pose** mit drehendem Schild-Wappen, solange der Schild aktiv ist (blinkt dunkel kurz vor Ende)
  - **Niederlage** beim Tod (die Figur wirbelt durch die Luft)
  - **Siegesjubel und Springen** des Gewinners auf dem Feld, bevor das Sieger-Banner kommt
  - Weinen und Tanzen sind im Sheet enthalten, werden aber noch nicht genutzt
- **Treffer:** Das Blut über dem Bildschirm blendet bis zum Respawn langsam aus. Ein kleines „KILL“ springt kurz über der
  getroffenen Figur auf und verschwindet nach etwa einer halben Sekunde (vorher groß, zitternd und dauerhaft in der Mitte).
- **Intro vor dem Start:** Statt des Bildes `tutorial.png` zeigen Karten im Menü-Stil die Steuerung. Lokal gibt es eine Karte
  pro Spieler, online „YOU“ mit beiden Tastensätzen und eine Spielerliste. Darunter stehen Tipps (?-Boxen, Kettenreaktion,
  Totenkopf, HURRY UP). Der Countdown läuft in der Mitte.
- Die alten Dateien (`player1-4.png`, `wall0-2.png`, `settingpage.png`, `tutorial.png`) liegen noch im Ordner, werden aber nicht mehr geladen.

### Handy und Tablet

- Auf Geräten mit Touchscreen erscheinen im Spiel ein **Stick zum Laufen** und ein **Bomben-Button**.
  Erkannt wird das automatisch (Finger als Haupteingabe), zum Testen am PC geht auch `?touch=1` in der Adresse.
- **Online:** ein Stick und ein Bomben-Button für die eigene Figur.
- **Lokal:** zwei Sätze, damit zwei Leute an einem Gerät spielen können (Spieler 1 links, Spieler 2 rechts),
  dazu eine Pause-Taste **II**.
- **Hochformat:** Spielfeld oben, Steuerung darunter. **Querformat:** Spielfeld in der Mitte, Steuerung links und rechts.
- Die Pause hat antippbare Buttons, am Rundenende reicht ein Tippen („TAP TO CONTINUE“),
  und das Intro zeigt die Touch-Steuerung statt der Tasten.
- **Ecken-Hilfe** (für alle, auch Tastatur): Wer an einer Säulenecke hängt und höchstens 18 px neben einem freien Gang steht,
  rutscht automatisch hinein. Mit dem Stick trifft man die Gänge sonst kaum.
- Auf Handys rendert das Spiel mit höchstens 2-facher Pixeldichte, damit es flüssig bleibt.

### Sonstiges

- **Neue Einstellungsseite:** Lautstärke mit − / + (0–4), beide Spieler mit Laufsteuerung und Bomben-Taste.
  Die Bomben-Taste per Klick neu belegen, ESC bricht ab. Lauftasten und die Taste des anderen Spielers werden abgelehnt.
  ESC oder BACK führt zurück ins Menü.

- Neue Soundeffekte (Bomben legen, Explosionen in drei Größen, Kick, Items, Herz, Schild, Totenkopf, HURRY UP, landende Blöcke, Pause).
- Eigener Speicherplatz für Einstellungen und eigene Online-Lobbys, Bomberman 1 und 2 kommen sich nicht in die Quere.

## Spielmodi

- **LOCAL – 2 PLAYERS:** wie im Original, zu zweit an einer Tastatur.
- **ONLINE (2–4 Spieler):** Einer klickt auf *CREATE ONLINE LOBBY* und bekommt einen
  4-stelligen Code. Die anderen geben den Code bei *JOIN* ein, egal von wo,
  oder öffnen den Einladungslink (*COPY INVITE LINK*, z. B. `…/arcade-game/?join=1234`).
  Sobald mindestens 2 Spieler da sind, kann der Host das Spiel starten.
  Online steuert jeder seinen eigenen Charakter mit **WASD oder den Pfeiltasten**
  und legt Bomben mit **einer der beiden Bomben-Tasten** (Standard: Leertaste / Alt Gr).

Die vier Charaktere: Spieler 1 weiß/blau, Spieler 2 weiß/türkis, Spieler 3 rot/gold, Spieler 4 schwarz/lime.

**HUD bei 3–4 Spielern:** Spieler 1 oben links nach rechts, Spieler 2 unten rechts nach links,
Spieler 3 von oben rechts die rechte Wand hinunter, Spieler 4 von unten links die linke Wand hinauf.

**Einstellungen** (Lautstärke, Bomben-Tasten) werden nur im eigenen Browser gespeichert
(`localStorage`) und gelten nur für einen selbst.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `js/bomberman.js` | entspricht `Bomberman.pde`: setup, draw, Tastatur, Spielzustände |
| `js/animations.js` | entspricht `Animations.pde` |
| `js/bomb.js` | entspricht `Bomb.pde` |
| `js/hud.js` | entspricht `HUD.pde`, plus kompaktes HUD für 3–4 Spieler |
| `js/karte.js` | entspricht `Karte.pde` |
| `js/player.js` | entspricht `Player.pde` |
| `js/items.js` | Balancing-Werte, Item-Liste und Totenkopf-Flüche (Bomberman 2) |
| `js/suddendeath.js` | Rundentimer, HURRY UP und fallende Blöcke (Bomberman 2) |
| `js/net.js` | Online-Lobby und Multiplayer (neu) |
| `js/touch.js` | Stick und Bomben-Button für Handy und Tablet (Bomberman 2) |
| `js/sound.js` | Ersatz für `processing.sound.SoundFile` (Web Audio API) |
| `js/helpers.js` | Java-Ganzzahldivision, Sprite-Ausschnitte, Tastennamen, Zufallsgenerator, Einstellungen |

p5.js (cdnjs) und PeerJS (jsDelivr) werden über ein CDN geladen.

### So funktioniert der Online-Modus

- Die Browser verbinden sich **direkt miteinander** (WebRTC über [PeerJS](https://peerjs.com/)).
  Den Lobby-Code vermittelt der kostenlose öffentliche PeerJS-Server, danach läuft alles direkt
  zwischen den Spielern. Ein eigener Server ist nicht nötig, das Spiel bleibt eine statische Webseite.
- **Lockstep:** Der Host sammelt die Tastendrücke aller Spieler und schickt sie 60-mal pro Sekunde
  als nummerierte Frames an alle. Jeder Browser simuliert dasselbe Spiel mit denselben Eingaben.
  Die Items entstehen mit einem gemeinsamen Zufalls-Seed, deshalb ist das Spielfeld überall gleich.
- Verlässt jemand das laufende Spiel, scheidet sein Charakter aus. Verlässt der Host das Spiel,
  ist die Runde für alle beendet.

**Bekannte Grenzen:**

- In manchen Netzwerken (strenge Firmen- oder Uni-Netze, manche Mobilfunknetze) kommt keine direkte
  Verbindung zustande. Dafür bräuchte man einen TURN-Server, der ist nicht eingebaut.
- Der Host sollte seinen Tab im Vordergrund lassen. Im Hintergrund drosseln Browser die Seite,
  und dann läuft das Spiel für alle langsamer.

**Sounds pro Spieler:** Jeder Charakter hat einen eigenen Todes- und Siegessound
(`hit1.wav` / `p1win.wav` bis `p4death.wav` / `p4win.wav`).

## Lokal starten

Wegen der Sicherheitsregeln im Browser funktioniert ein Doppelklick auf `index.html` nicht
(Bilder, Schriften und Sounds werden dann blockiert). Stattdessen einen lokalen Server starten:

```bash
python -m http.server 8080 -d bbm2
```

Danach <http://localhost:8080> öffnen. Den Online-Modus kann man lokal mit zwei Browser-Tabs testen.

## Online stellen

**GitHub Pages:** Den Inhalt von `bbm2/` in ein Repo legen und unter
*Settings → Pages* veröffentlichen (Bomberman 1 lief über einen Workflow im Repo `arcade-game`).

**itch.io:** Den *Inhalt* von `bbm2/` zippen (die `index.html` muss oben im ZIP liegen),
als neues Projekt mit „Kind of project: HTML“ hochladen und eine Größe von 750×750 einstellen.

**Netlify / Cloudflare Pages:** Den Ordner `bbm2/` per Drag & Drop hochladen.

## Credits

Menümusik: „That's it for today (LOOP)“ von ViRiX Dreamcore, CC-Lizenz.

> Some of the songs and/or sound effects in this project were created by ViRiX Dreamcore (David Mckee).
> [www.virixcore.net](https://www.virixcore.net) for more information

Figuren-Sprites (alle Animationen der Spieler): **ripped by Phongpon**, für die 4 Spieler umgefärbt.

Beide Hinweise stehen auch im Spiel: auf dem Startbildschirm und auf dem Bildschirm hinter dem Beenden-Button (X).

## Unterschiede zur Processing-Version (Bomberman 1)

- Online-Modus für 2–4 Spieler mit Lobby-Code und zwei neuen Charakterfarben.
- Die Menümusik ist ein lizenzfreier Song (siehe Credits) statt des Originals aus der Processing-Version.
- Beim Laden erscheint „CLICK TO START“, weil Browser Ton erst nach einer Nutzeraktion erlauben.
- Der Beenden-Button (X) zeigt einen Abschiedsbildschirm, denn ein Browser-Tab lässt sich nicht vom Spiel schließen.
- Das Spiel läuft unabhängig von der Bildwiederholrate des Monitors mit festen 60 Spiel-Frames pro Sekunde.
- Bomben-Tasten werden als Tastencode gespeichert, dadurch funktionieren auch Sonderzeichen beim Neubelegen.
- Nach einer Runde werden alle Bomben gelöscht (vorher blieb wegen `remove(i)` in der Schleife jede zweite übrig).
- Der Schutz nach dem Respawn dauert für alle Spieler 5 Sekunden (vorher Spieler 1: 5 s, Spieler 2: 4 s).
- Die Runde endet, sobald nur noch ein Spieler Leben hat, und erst nach dessen Todesanimation.
  Sterben die letzten beiden kurz nacheinander, ergibt das jetzt ein Unentschieden.
