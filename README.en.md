# fluent-osk

**[Leggi in Italiano](README.md)**

![GNOME Shell](https://img.shields.io/badge/GNOME_Shell-50-blue)
![License](https://img.shields.io/badge/License-GPLv3-green)

Standalone On-Screen Keyboard (OSK) for GNOME Shell 50 featuring a TKL form factor, high-frequency input handling, key gestures, and runtime layout configuration.

## Demo

move the cursor using the spacebar:
<img width="1000" height="285" alt="spaceslider" src="https://github.com/user-attachments/assets/1bc6c466-9778-4bc9-a782-9a8b6c2f9f75" />

select and delete text:
<img width="1000" height="285" alt="backslider" src="https://github.com/user-attachments/assets/1d0c86d2-7fce-4ced-9b43-6085090619ed" />

---
partially vibecoded, I don't have the exhaustive skills to understand all the dynamics of gnome to the point of creating an entire extension
---
## Technical Specifications & Features

### UI Architecture & Window Modes
* **Form Factor:** TKL layout including `Fn` row (combined with the numerical row) and standard modifiers for complex keybindings (e.g., `Ctrl+Alt+Del`, `Super+Key`).
* **Window Modes:** Supports 3 rendering states:
  * `Dock`: anchored to the bottom screen edge.
  * `Float`: draggable floating window.
  * `Full`: extended full-width layout.
* **Trigger:** Dedicated GNOME Shell Top Bar indicator for manual toggling.
* **Geometry:** Configurable global container width/height and horizontal/vertical key grid spacing.
* **Typography:** High-legibility default font bundled (`fonts/`), with configurable override for any system font.

### Input Engine & Gestures
* **Fast Input:** to prevent dropped characters during fast typing.
* **Key Repeat & Backspace:** Native key-repeat implementation across all keys and continuous deletion on `Backspace`.
* **Modifier Behavior:** Switchable modifier state logic between *Hold* (active while pressed) and *Latch/Lock* (toggle on tap).
* **Dependency Highlighting:** Automatic visual feedback on secondary/derived keys when their parent modifier or layer is active.
* **Auto-Pairing (Smart Brackets/Quotes):** Automatic closing of `(`, `"`, `'` delimiters. Includes *overtype* logic: manually typing the closing character skips duplicate insertion and advances the cursor past the delimiter.

| Key | Action | Behavior |
| :--- | :--- | :--- |
| `Spacebar` | Horizontal drag (left-right) | Continuous text cursor movement (Left/Right) |
| `Backspace` | Horizontal drag (from right to left) | Progressive selection of preceding text and deletion on release |

### Layout Engine & Hot-Reload
* **Built-in Presets:** `IT (ISO)` and `US (ANSI)`.
* **Custom Layout Engine:** Integrated preferences editor with real-time application (**hot-reload** on save, no GNOME Shell restart required). Capabilities:
  * Append or remove keys within the matrix.
  * Override keycodes/values of existing keys.
  * Customize per-key width, color (HEX/RGBA), and display label.


I'm open to bugs and additional features, but I'm not guaranteed to implement them (so far, the keyboard already seems remarkably complete and significantly superior to any other touch keyboard I've tried so far on Linux, but you never know).
# Known bugs:
I hope not.
---
 ### I have no intention of keeping this extension active or making it compatible with older versions of GNOME. 
 I'd hope someone more knowledgeable could review it and maintain good code quality. 
 If no one comes forward, this extension will directly follow the versions of Linux and GNOME I use on my laptop.
 
