# fluent-osk

**[Read in English](README.en.md)**

![GNOME Shell](https://img.shields.io/badge/GNOME_Shell-50-blue)
![License](https://img.shields.io/badge/License-GPLv3-green)

On-Screen Keyboard (OSK) indipendente per GNOME Shell 50 con layout TKL con  gestione avanzata degli eventi di input, gesture su tasti e configurazione runtime dei layout.

## Demo

...con calma arrivano

---
Parzialmente vibe-coded, non ho le competenze necessarie per comprendere tutte le dinamiche di GNOME al punto da creare un'estensione completa
---
## Specifiche Tecniche e Funzionalità

### Architettura UI e Modalità
* **Form Factor:** Layout TKL comprensivo di riga `Fn` e modificatori standard per l'invio di shortcut composti (es. `Ctrl+Alt+Canc`, `Super+Tasto`).
* **Window Modes:** Supporto per 3 stati di rendering:
  * `Dock`: ancorata al margine inferiore dello schermo.
  * `Float`: finestra mobile riposizionabile.
  * `Full`: larghezza estesa.
* **Trigger:** Applet/indicatore integrato nella Top Bar di GNOME Shell per il toggle manuale.
* **Geometria:** Parametri configurabili per larghezza/altezza globale del container e padding/margini (orizzontali e verticali) della griglia dei tasti.
* **Tipografia:** Font ad alta leggibilità incluso di default (`fonts/`), con override configurabile verso qualsiasi font di sistema.

### Motore di Input e Gesture
* **Responsiva** evita il drop di caratteri durante la digitazione rapida.
* **Key Repeat & Backspace:** Implementazione nativa del key-repeat (pressione prolungata) su tutti i tasti e cancellazione continua su `Backspace`.
* **Stato Modificatori:** Comportamento dei tasti modificatori commutabile tra *Hold* (attivo finché premuto) e *Latch/Lock* (mantieni stato al tap).
* **Evidenziazione Dipendenze:** Feedback visivo automatico sui tasti secondari/derivati quando viene attivato il relativo tasto modificatore o layer.
* **Auto-Pairing (Smart Brackets/Quotes):** Chiusura automatica dei delimitatori `(`, `"`, `'`. Include la logica di *overtype*: digitando manualmente il carattere di chiusura già inserito, l'input viene scartato e il cursore avanza oltre il delimitatore.

| Tasto | Azione | Comportamento |
| :--- | :--- | :--- |
| `Spacebar` | Drag orizzontale dx-sx| Spostamento continuo del cursore di testo (Left/Right) |
| `Backspace` | Drag orizzontale verso sinistra | Selezione progressiva del testo precedente e cancellazione al rilascio |

### Gestione Layout e Hot-Reload
* **Preset Inclusi:** `IT (ISO)` e `US (ANSI)`.
* **Custom Layout Engine:** Editor integrato nelle preferenze con applicazione in tempo reale (**hot-reload** al salvataggio, nessun riavvio di GNOME Shell richiesto). Permette di:
  * Aggiungere o rimuovere tasti nella matrice.
  * Modificare i keycode/valori dei tasti esistenti.
  * Sovrascrivere larghezza (width), colore (HEX/RGBA) e label visualizzata per singolo tasto.
non ho l'intenzione di mantenere attiva questa estensione o renderla compatibile con versioni più vecchie di GNOME, spererei in una persona più competente possa recensire e mantenere una buona qualità nel codice. nel caso non si facesse avanti nessuno , questa estensione seguirà direttamente le versioni che userò di linux e GNOME sul mio portatile.
# bug noti:
spero di no
---
### non ho l'intenzione di mantenere attiva questa estensione o renderla compatibile con versioni più vecchie di GNOME
spererei in una persona più competente possa recensire e mantenere una buona qualità nel codice. nel caso non si facesse avanti nessuno , questa estensione seguirà direttamente le versioni che userò di fedora e GNOME sul mio portatile.
