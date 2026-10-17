import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

export const Layouts = {
    it: {
        name: "Italiano (TKL Compatta)",
        numberRow: [
            { code: 1, label: "Esc", width: 1.0, type: "fn" },
            { code: 2, label: "1", shift: "!", altgr: "¹" },
            { code: 3, label: "2", shift: "\"", altgr: "²" },
            { code: 4, label: "3", shift: "£", altgr: "³" },
            { code: 5, label: "4", shift: "$", altgr: "¼" },
            { code: 6, label: "5", shift: "%", altgr: "½" },
            { code: 7, label: "6", shift: "&", altgr: "¬" },
            { code: 8, label: "7", shift: "/", altgr: "{" },
            { code: 9, label: "8", shift: "(", altgr: "[" },
            { code: 10, label: "9", shift: ")", altgr: "]" },
            { code: 11, label: "0", shift: "=", altgr: "}" },
            { code: 12, label: "'", shift: "?", altgr: "`" },
            { code: 13, label: "ì", shift: "^", altgr: "~" },
            { code: 111, label: "Canc", width: 1.0, type: "delete" },
            { code: 14, label: "Backspace", width: 1.5, type: "backspace" },
        ],
        mainRows: [
            [
                { code: 15, label: "Tab", width: 1.5, type: "fn" },
                { code: 16, label: "q", shift: "Q" },
                { code: 17, label: "w", shift: "W" },
                { code: 18, label: "e", shift: "E", altgr: "€" },
                { code: 19, label: "r", shift: "R" },
                { code: 20, label: "t", shift: "T" },
                { code: 21, label: "y", shift: "Y" },
                { code: 22, label: "u", shift: "U" },
                { code: 23, label: "i", shift: "I" },
                { code: 24, label: "o", shift: "O" },
                { code: 25, label: "p", shift: "P" },
                { code: 26, label: "è", shift: "é", altgr: "[", shiftAltgr: "{" },
                { code: 27, label: "+", shift: "*", altgr: "]", shiftAltgr: "}" },
                { code: 28, label: "Invio", width: 1.5, type: "enter", enterPart: "top" },
            ],
            [
                { code: 58, label: "Bloc Maiusc", width: 1.75, type: "caps" },
                { code: 30, label: "a", shift: "A" },
                { code: 31, label: "s", shift: "S" },
                { code: 32, label: "d", shift: "D" },
                { code: 33, label: "f", shift: "F" },
                { code: 34, label: "g", shift: "G" },
                { code: 35, label: "h", shift: "H" },
                { code: 36, label: "j", shift: "J" },
                { code: 37, label: "k", shift: "K" },
                { code: 38, label: "l", shift: "L" },
                { code: 39, label: "ò", shift: "ç", altgr: "@" },
                { code: 40, label: "à", shift: "°", altgr: "#" },
                { code: 41, label: "ù", shift: "§" },
                { code: 28, label: "↵", width: 1.25, type: "enter", enterPart: "bottom" },
            ],
            [
                { code: 42, label: "Maiusc", width: 1.5, type: "shift" },
                { code: 86, label: "<", shift: ">", altgr: "«", shiftAltgr: "»" },
                { code: 44, label: "z", shift: "Z" },
                { code: 45, label: "x", shift: "X" },
                { code: 46, label: "c", shift: "C" },
                { code: 47, label: "v", shift: "V" },
                { code: 48, label: "b", shift: "B" },
                { code: 49, label: "n", shift: "N" },
                { code: 50, label: "m", shift: "M", altgr: "µ" },
                { code: 51, label: ",", shift: ";" },
                { code: 52, label: ".", shift: ":" },
                { code: 53, label: "-", shift: "_" },
                { code: 54, label: "Maiusc", width: 1.5, type: "shift" },
                { code: 103, label: "▲", width: 0.9, type: "arrow" },
                { code: 0, label: "FN", width: 0.9, type: "fn_toggle", behavior: "toggle" },
            ],
            [
                { code: 29, label: "Ctrl", width: 1.25, type: "ctrl", behavior: "toggle" },
                { code: 125, label: "Win", width: 1.0, type: "super" },
                { code: 56, label: "Alt", width: 1.25, type: "alt", behavior: "toggle" },
                { code: 57, label: "Spazio", width: 6.5, type: "space" },
                { code: 100, label: "Alt Gr", width: 1.25, type: "altgr" },
                { code: 97, label: "Ctrl", width: 1.25, type: "ctrl", behavior: "toggle" },
                { code: 105, label: "◀", width: 0.9, type: "arrow" },
                { code: 108, label: "▼", width: 0.84, type: "arrow" },
                { code: 106, label: "▶", width: 0.9, type: "arrow" },
            ]
        ]
    },
    us: {
        name: "English (US TKL)",
        numberRow: [
            { code: 1, label: "Esc", width: 1.0, type: "fn" },
            { code: 2, label: "1", shift: "!" },
            { code: 3, label: "2", shift: "@" },
            { code: 4, label: "3", shift: "#" },
            { code: 5, label: "4", shift: "$" },
            { code: 6, label: "5", shift: "%" },
            { code: 7, label: "6", shift: "^" },
            { code: 8, label: "7", shift: "&" },
            { code: 9, label: "8", shift: "*" },
            { code: 10, label: "9", shift: "(" },
            { code: 11, label: "0", shift: ")" },
            { code: 12, label: "-", shift: "_" },
            { code: 13, label: "=", shift: "+" },
            { code: 111, label: "Del", width: 1.0, type: "delete" },
            { code: 14, label: "Backspace", width: 1.5, type: "backspace" },
        ],
        mainRows: [
            [
                { code: 15, label: "Tab", width: 1.5, type: "fn" },
                { code: 16, label: "q", shift: "Q" },
                { code: 17, label: "w", shift: "W" },
                { code: 18, label: "e", shift: "E" },
                { code: 19, label: "r", shift: "R" },
                { code: 20, label: "t", shift: "T" },
                { code: 21, label: "y", shift: "Y" },
                { code: 22, label: "u", shift: "U" },
                { code: 23, label: "i", shift: "I" },
                { code: 24, label: "o", shift: "O" },
                { code: 25, label: "p", shift: "P" },
                { code: 26, label: "[", shift: "{" },
                { code: 27, label: "]", shift: "}" },
                { code: 43, label: "\\", shift: "|", width: 1.5 },
            ],
            [
                { code: 58, label: "Caps Lock", width: 1.75, type: "caps" },
                { code: 30, label: "a", shift: "A" },
                { code: 31, label: "s", shift: "S" },
                { code: 32, label: "d", shift: "D" },
                { code: 33, label: "f", shift: "F" },
                { code: 34, label: "g", shift: "G" },
                { code: 35, label: "h", shift: "H" },
                { code: 36, label: "j", shift: "J" },
                { code: 37, label: "k", shift: "K" },
                { code: 38, label: "l", shift: "L" },
                { code: 39, label: ";", shift: ":" },
                { code: 40, label: "'", shift: "\"" },
                { code: 28, label: "Enter", width: 2.25, type: "enter" },
            ],
            [
                { code: 42, label: "Shift", width: 1.5, type: "shift" },
                { code: 41, label: "`", shift: "~" },
                { code: 44, label: "z", shift: "Z" },
                { code: 45, label: "x", shift: "X" },
                { code: 46, label: "c", shift: "C" },
                { code: 47, label: "v", shift: "V" },
                { code: 48, label: "b", shift: "B" },
                { code: 49, label: "n", shift: "N" },
                { code: 50, label: "m", shift: "M" },
                { code: 51, label: ",", shift: "<" },
                { code: 52, label: ".", shift: ">" },
                { code: 53, label: "/", shift: "?" },
                { code: 54, label: "Shift", width: 1.5, type: "shift" },
                { code: 103, label: "▲", width: 0.9, type: "arrow" },
                { code: 0, label: "FN", width: 0.9, type: "fn_toggle", behavior: "toggle" },
            ],
            [
                { code: 29, label: "Ctrl", width: 1.25, type: "ctrl", behavior: "toggle" },
                { code: 125, label: "Win", width: 1.0, type: "super" },
                { code: 56, label: "Alt", width: 1.25, type: "alt", behavior: "toggle" },
                { code: 57, label: "Space", width: 6.5, type: "space" },
                { code: 100, label: "Alt", width: 1.25, type: "alt", behavior: "toggle" },
                { code: 97, label: "Ctrl", width: 1.25, type: "ctrl", behavior: "toggle" },
                { code: 105, label: "◀", width: 0.9, type: "arrow" },
                { code: 108, label: "▼", width: 0.84, type: "arrow" },
                { code: 106, label: "▶", width: 0.9, type: "arrow" },
            ]
        ]
    }
};

export function getCustomLayoutPath() {
    return GLib.build_filenamev([GLib.get_user_config_dir(), 'fluent-osk', 'custom_layout.json']);
}

export function loadCustomLayout() {
    const path = getCustomLayoutPath();
    const file = Gio.File.new_for_path(path);
    if (!file.query_exists(null)) {
        return null;
    }
    try {
        const [ok, bytes] = file.load_contents(null);
        if (ok) {
            const str = new TextDecoder().decode(bytes);
            return JSON.parse(str);
        }
    } catch (e) {
        console.error('[FluentOSK] Failed to load custom layout:', e);
    }
    return null;
}

export function saveCustomLayout(layoutObj) {
    const dirPath = GLib.build_filenamev([GLib.get_user_config_dir(), 'fluent-osk']);
    GLib.mkdir_with_parents(dirPath, 0o755);
    const path = getCustomLayoutPath();
    const file = Gio.File.new_for_path(path);
    const jsonStr = JSON.stringify(layoutObj, null, 2);
    file.replace_contents(jsonStr, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
}
