import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import { Layouts, loadCustomLayout, saveCustomLayout } from './layouts.js';

function bindIntToSpinRow(settings, key, spinRow) {
    spinRow.value = settings.get_int(key);
    spinRow.connect('notify::value', () => {
        const currentSetting = settings.get_int(key);
        const spinVal = Math.round(spinRow.value);
        if (currentSetting !== spinVal) {
            settings.set_int(key, spinVal);
        }
    });
    settings.connect(`changed::${key}`, () => {
        const val = settings.get_int(key);
        if (Math.round(spinRow.value) !== val) {
            spinRow.value = val;
        }
    });
}

function createColorPickerRow(title, subtitle, onColorSelected, onReset) {
    const row = new Adw.ActionRow({
        title: title,
        subtitle: subtitle || '',
    });

    const box = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 8,
        valign: Gtk.Align.CENTER,
    });

    const popover = new Gtk.Popover();
    popover.set_autohide(true);

    const chooser = new Gtk.ColorChooserWidget({ use_alpha: true });
    popover.set_child(chooser);

    const swatch = new Gtk.Box({
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
    });
    swatch.set_size_request(36, 22);

    const menuBtn = new Gtk.MenuButton({
        popover: popover,
        valign: Gtk.Align.CENTER,
        tooltip_text: _('Scegli colore'),
    });
    menuBtn.set_child(swatch);

    function updateSwatchStyle(colorStr) {
        const provider = new Gtk.CssProvider();
        let bg = colorStr || 'transparent';
        let border = colorStr ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.2)';
        let css = `box { background-color: ${bg}; border: 1px solid ${border}; border-radius: 4px; min-width: 36px; min-height: 22px; }`;
        provider.load_from_string(css);
        swatch.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
    }
    updateSwatchStyle('');

    let internalUpdate = false;
    chooser.connect('notify::rgba', () => {
        if (internalUpdate) return;
        const rgba = chooser.get_rgba();
        if (rgba) {
            const colorStr = rgba.to_string();
            updateSwatchStyle(colorStr);
            onColorSelected(colorStr);
        }
    });

    const resetBtn = new Gtk.Button({
        icon_name: 'edit-clear-symbolic',
        valign: Gtk.Align.CENTER,
        tooltip_text: _('Ripristina predefinito'),
    });
    resetBtn.connect('clicked', () => {
        updateSwatchStyle('');
        onReset();
    });

    box.append(menuBtn);
    box.append(resetBtn);
    row.add_suffix(box);
    row.activatable_widget = menuBtn;

    return {
        row,
        colorBtn: menuBtn,
        setColor: (colorStr) => {
            internalUpdate = true;
            try {
                if (!colorStr) {
                    const emptyRgba = new Gdk.RGBA();
                    emptyRgba.parse('rgba(0,0,0,0)');
                    chooser.set_rgba(emptyRgba);
                    updateSwatchStyle('');
                } else {
                    const rgba = new Gdk.RGBA();
                    if (rgba.parse(colorStr)) {
                        chooser.set_rgba(rgba);
                        updateSwatchStyle(colorStr);
                    }
                }
            } finally {
                internalUpdate = false;
            }
        }
    };
}

export default class FluentOskPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // ==========================================
        // Page 1: Layout, Dimensioni & Spaziature
        // ==========================================
        const page1 = new Adw.PreferencesPage({
            title: _('Aspetto e Layout'),
            icon_name: 'input-keyboard-symbolic',
        });
        window.add(page1);

        // Group 1: Modalità Docking & Finestre
        const dockGroup = new Adw.PreferencesGroup({
            title: _('Posizionamento e Gestione Finestre'),
            description: _('Configura come la tastiera si ancora allo schermo e interagisce con le applicazioni aperte'),
        });
        page1.add(dockGroup);

        // Dock Full Strip (Strut Mode)
        const fullStripRow = new Adw.SwitchRow({
            title: _('Copertura a tutta larghezza (Strut Mode)'),
            subtitle: _('La tastiera copre l\'intera larghezza inferiore dello schermo e sposta/ridimensiona le finestre verso l\'alto affinché nessun campo di testo venga coperto'),
        });
        settings.bind('dock-full-strip', fullStripRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        dockGroup.add(fullStripRow);

        // Full Strip with Centered Keys
        const centerKeysRow = new Adw.SwitchRow({
            title: _('Centra i tasti nella barra a tutta larghezza'),
            subtitle: _('In modalità a tutta larghezza (Strut Mode), mantiene i tasti alla larghezza standard centrati lasciando ampi margini a sinistra e destra'),
        });
        settings.bind('full-strip-centered-keys', centerKeysRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        dockGroup.add(centerKeysRow);

        // Dock Bottom
        const dockBottomRow = new Adw.SwitchRow({
            title: _('Ancora al bordo inferiore'),
            subtitle: _('Se disattivato, la tastiera fluttua liberamente ed è trascinabile dallo schermo'),
        });
        settings.bind('dock-bottom', dockBottomRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        dockGroup.add(dockBottomRow);

        // Padding Bottom
        const padBottomRow = new Adw.SpinRow({
            title: _('Padding dal bordo inferiore (px)'),
            subtitle: _('Distanza o spazio di sicurezza dal bordo inferiore dello schermo'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 60,
                step_increment: 2,
            }),
        });
        bindIntToSpinRow(settings, 'padding-bottom', padBottomRow);
        dockGroup.add(padBottomRow);

        // Group 2: Dimensioni
        const dimGroup = new Adw.PreferencesGroup({
            title: _('Dimensioni'),
            description: _('Regola la larghezza e l\'altezza occupata dalla tastiera'),
        });
        page1.add(dimGroup);

        // Layout variant selector
        const layoutRow = new Adw.ComboRow({
            title: _('Layout di battitura attivo'),
            subtitle: _('Seleziona il layout predefinito o personalizzato'),
            model: new Gtk.StringList({
                strings: ['Italiano (TKL Compatta)', 'English (US TKL)', 'Personalizzato (Custom Layout)']
            }),
        });
        const currentLayout = settings.get_string('layout-variant');
        if (currentLayout === 'custom') {
            layoutRow.selected = 2;
        } else if (currentLayout === 'us') {
            layoutRow.selected = 1;
        } else {
            layoutRow.selected = 0;
        }
        layoutRow.connect('notify::selected', () => {
            if (layoutRow.selected === 2) {
                settings.set_string('layout-variant', 'custom');
            } else if (layoutRow.selected === 1) {
                settings.set_string('layout-variant', 'us');
            } else {
                settings.set_string('layout-variant', 'it');
            }
        });
        dimGroup.add(layoutRow);

        // Width Percent
        const widthRow = new Adw.SpinRow({
            title: _('Larghezza tastiera (%)'),
            subtitle: _('Percentuale rispetto alla larghezza dello schermo (usato quando non in modalità a tutta larghezza)'),
            adjustment: new Gtk.Adjustment({
                lower: 40,
                upper: 100,
                step_increment: 5,
            }),
        });
        bindIntToSpinRow(settings, 'width-percent', widthRow);
        dimGroup.add(widthRow);

        // Height Percent
        const heightRow = new Adw.SpinRow({
            title: _('Altezza tastiera (%)'),
            subtitle: _('Percentuale rispetto all\'altezza dello schermo'),
            adjustment: new Gtk.Adjustment({
                lower: 20,
                upper: 55,
                step_increment: 2,
            }),
        });
        bindIntToSpinRow(settings, 'height-percent', heightRow);
        dimGroup.add(heightRow);

        // Group: Leggibilità del testo
        const readGroup = new Adw.PreferencesGroup({
            title: _('Leggibilità del testo e Font'),
            description: _('Di default viene usato Atkinson Hyperlegible Next, progettato dal Braille Institute per la massima leggibilità, bassa visione, astigmatismo e dislessia'),
        });
        page1.add(readGroup);

        const fontChooserRow = new Adw.ActionRow({
            title: _('Seleziona font di sistema'),
            subtitle: _('Sfoglia graficamente i font installati o clicca la gomma per ripristinare il default'),
        });

        const fontDialog = new Gtk.FontDialog();
        const fontDialogBtn = new Gtk.FontDialogButton({
            dialog: fontDialog,
            valign: Gtk.Align.CENTER,
        });

        const currentFont = (settings.get_string('font-family') || '').trim();
        try {
            fontDialogBtn.set_font_desc(Pango.FontDescription.from_string(currentFont ? `${currentFont} 12` : 'Atkinson Hyperlegible Next 12'));
        } catch (e) {}

        const resetFontBtn = new Gtk.Button({
            icon_name: 'edit-clear-symbolic',
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Ripristina font predefinito (Atkinson Hyperlegible Next)'),
        });

        const fontBtnBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 6,
            valign: Gtk.Align.CENTER,
        });
        fontBtnBox.append(fontDialogBtn);
        fontBtnBox.append(resetFontBtn);
        fontChooserRow.add_suffix(fontBtnBox);
        fontChooserRow.activatable_widget = fontDialogBtn;
        readGroup.add(fontChooserRow);

        const fontRow = new Adw.EntryRow({
            title: _('Nome font personalizzato (vuoto = automatico)'),
        });
        settings.bind('font-family', fontRow, 'text', Gio.SettingsBindFlags.DEFAULT);

        fontDialogBtn.connect('notify::font-desc', () => {
            const desc = fontDialogBtn.get_font_desc();
            if (desc) {
                const family = desc.get_family();
                if (family && family !== settings.get_string('font-family')) {
                    settings.set_string('font-family', family);
                }
            }
        });

        resetFontBtn.connect('clicked', () => {
            settings.set_string('font-family', '');
            fontRow.text = '';
            try {
                fontDialogBtn.set_font_desc(Pango.FontDescription.from_string('Atkinson Hyperlegible Next 12'));
            } catch (e) {}
        });

        settings.connect('changed::font-family', () => {
            const f = (settings.get_string('font-family') || '').trim();
            try {
                fontDialogBtn.set_font_desc(Pango.FontDescription.from_string(f ? `${f} 12` : 'Atkinson Hyperlegible Next 12'));
            } catch (e) {}
        });

        readGroup.add(fontRow);

        const fontScaleRow = new Adw.SpinRow({
            title: _('Dimensione del testo (%)'),
            subtitle: _('Ingrandisce le scritte sui tasti; il testo si riduce da solo solo se non entra nel tasto'),
            adjustment: new Gtk.Adjustment({
                lower: 80,
                upper: 160,
                step_increment: 5,
            }),
        });
        bindIntToSpinRow(settings, 'font-scale', fontScaleRow);
        readGroup.add(fontScaleRow);

        // Group 3: Spaziature tra i tasti
        const spacingGroup = new Adw.PreferencesGroup({
            title: _('Spaziature e Margini dei Tasti'),
            description: _('Distanze orizzontali e verticali separate tra i singoli tasti e la riga numerica'),
        });
        page1.add(spacingGroup);

        // Horizontal Gap (key-gap-x)
        const gapXRow = new Adw.SpinRow({
            title: _('Distanza orizzontale tra i tasti (px)'),
            subtitle: _('Spazio orizzontale tra i tasti affiancati nella stessa riga'),
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 16,
                step_increment: 1,
            }),
        });
        bindIntToSpinRow(settings, 'key-gap-x', gapXRow);
        spacingGroup.add(gapXRow);

        // Vertical Gap (key-gap-y)
        const gapYRow = new Adw.SpinRow({
            title: _('Distanza verticale tra le righe (px)'),
            subtitle: _('Spazio verticale tra una riga di tasti e quella sottostante'),
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 16,
                step_increment: 1,
            }),
        });
        bindIntToSpinRow(settings, 'key-gap-y', gapYRow);
        spacingGroup.add(gapYRow);

        // Number row separation (TKL gap)
        const numGapRow = new Adw.SpinRow({
            title: _('Spaziatura riga numeri (Gap TKL) (px)'),
            subtitle: _('Spazio extra che separa la riga dei numeri dalla riga QWERTY'),
            adjustment: new Gtk.Adjustment({
                lower: 2,
                upper: 30,
                step_increment: 2,
            }),
        });
        bindIntToSpinRow(settings, 'number-row-gap', numGapRow);
        spacingGroup.add(numGapRow);

        // Key corner radius
        const radiusRow = new Adw.SpinRow({
            title: _('Raggio angoli dei tasti (px)'),
            subtitle: _('Arrotondamento dei tasti stile Windows 11 Fluent'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 20,
                step_increment: 1,
            }),
        });
        bindIntToSpinRow(settings, 'key-radius', radiusRow);
        spacingGroup.add(radiusRow);

        // Group 4: Stile Tasti Modificati (AltGr, Shift, FN)
        const modStyleGroup = new Adw.PreferencesGroup({
            title: _('Stile Tasti Modificati (Combinazioni AltGr, Shift, FN)'),
            description: _('Scegli i colori di sfondo e contrasto per i tasti che cambiano simbolo quando un modificatore è attivo (es. [ con AltGr o F1..F12 con FN)'),
        });
        page1.add(modStyleGroup);

        const modBgPicker = createColorPickerRow(
            _('Colore di sfondo tasti modificati'),
            _('Sfondo con ruota colori e trasparenza (lascia vuoto per il grigio scuro Fluent standard)'),
            (colorStr) => settings.set_string('modified-key-bg-color', colorStr),
            () => {
                settings.set_string('modified-key-bg-color', '');
                modBgPicker.setColor('');
            }
        );
        modBgPicker.setColor(settings.get_string('modified-key-bg-color'));
        modStyleGroup.add(modBgPicker.row);

        const modTextPicker = createColorPickerRow(
            _('Colore simbolo tasti modificati'),
            _('Colore del simbolo mostrato durante la combinazione ad alto contrasto'),
            (colorStr) => settings.set_string('modified-key-text-color', colorStr),
            () => {
                settings.set_string('modified-key-text-color', '');
                modTextPicker.setColor('');
            }
        );
        modTextPicker.setColor(settings.get_string('modified-key-text-color'));
        modStyleGroup.add(modTextPicker.row);

        // ==========================================
        // Page 2: Reattività & Gesti
        // ==========================================
        const page2 = new Adw.PreferencesPage({
            title: _('Reattività e Gesti'),
            icon_name: 'input-touchpad-symbolic',
        });
        window.add(page2);

        // Group: Key repeat & fluid writing
        const speedGroup = new Adw.PreferencesGroup({
            title: _('Velocità di Scrittura (Stile Android / GBoard)'),
            description: _('Reattività per Backspace e cancellazione rapida continua'),
        });
        page2.add(speedGroup);

        // Repeat delay
        const delayRow = new Adw.SpinRow({
            title: _('Ritardo inizio ripetizione (ms)'),
            subtitle: _('Tempo di attesa prima che un tasto tenuto premuto inizi a ripetersi (default: 320ms)'),
            adjustment: new Gtk.Adjustment({
                lower: 150,
                upper: 800,
                step_increment: 20,
            }),
        });
        bindIntToSpinRow(settings, 'repeat-delay', delayRow);
        speedGroup.add(delayRow);

        // Repeat rate
        const rateRow = new Adw.SpinRow({
            title: _('Intervallo ripetizione (ms)'),
            subtitle: _('Frequenza di ripetizione continua (default: 36ms per massima fluidità)'),
            adjustment: new Gtk.Adjustment({
                lower: 15,
                upper: 120,
                step_increment: 5,
            }),
        });
        bindIntToSpinRow(settings, 'repeat-interval', rateRow);
        speedGroup.add(rateRow);

        // Spacebar and Backspace Gestures
        const gestureGroup = new Adw.PreferencesGroup({
            title: _('Gesti di Scorrimento (Spazio e Backspace)'),
            description: _('Gesti stile GBoard: scorrimento cursore sulla barra spazio e cancellazione a ritroso su Backspace'),
        });
        page2.add(gestureGroup);

        // Spacebar sensitivity
        const sensRow = new Adw.SpinRow({
            title: _('Sensibilità cursore Spazio (px/carattere)'),
            subtitle: _('Pixel di trascinamento orizzontale sulla barra spazio per ogni carattere spostato'),
            adjustment: new Gtk.Adjustment({
                lower: 6,
                upper: 40,
                step_increment: 2,
            }),
        });
        bindIntToSpinRow(settings, 'space-slider-sensitivity', sensRow);
        gestureGroup.add(sensRow);

        // Backspace sensitivity
        const backspaceSensRow = new Adw.SpinRow({
            title: _('Sensibilità swipe indietro Backspace (px/carattere)'),
            subtitle: _('Pixel di trascinamento verso sinistra su Backspace per selezionare ciascun carattere da cancellare'),
            adjustment: new Gtk.Adjustment({
                lower: 8,
                upper: 45,
                step_increment: 2,
            }),
        });
        bindIntToSpinRow(settings, 'backspace-slider-sensitivity', backspaceSensRow);
        gestureGroup.add(backspaceSensRow);

        // Sound switch
        const soundRow = new Adw.SwitchRow({
            title: _('Feedback sonoro alla pressione'),
            subtitle: _('Riproduce un lieve clic audio al tocco di ogni tasto'),
        });
        settings.bind('play-sound', soundRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        gestureGroup.add(soundRow);

        // Top panel button
        const panelRow = new Adw.SwitchRow({
            title: _('Pulsante nel pannello superiore'),
            subtitle: _('Mostra l\'icona della tastiera nella barra in alto per aprirla/chiuderla con un clic'),
        });
        settings.bind('show-panel-button', panelRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        gestureGroup.add(panelRow);

        // Group: Digitazione Intelligente
        const smartGroup = new Adw.PreferencesGroup({
            title: _('Digitazione Intelligente'),
            description: _('Assistenza avanzata per parentesi, virgolette e simboli accoppiati'),
        });
        page2.add(smartGroup);

        const autoPairsRow = new Adw.SwitchRow({
            title: _('Completamento intelligente parentesi e virgolette'),
            subtitle: _('Chiude automaticamente le coppie (), [], {}, "" posizionando il cursore al centro, ed esce con uno spazio se si preme per abitudine la chiusura'),
        });
        settings.bind('smart-auto-pairs', autoPairsRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        smartGroup.add(autoPairsRow);

        // ==========================================
        // Page 3: Studio Customizzazione Layout Completa
        // ==========================================
        this._buildLayoutStudioPage(window, settings, layoutRow);
    }

    _buildLayoutStudioPage(window, settings, layoutSelectorRow) {
        const page3 = new Adw.PreferencesPage({
            title: _('Studio Layout & Tasti'),
            icon_name: 'preferences-desktop-keyboard-shortcuts-symbolic',
        });
        window.add(page3);

        let editingLayout = loadCustomLayout();
        if (!editingLayout) {
            editingLayout = JSON.parse(JSON.stringify(Layouts.it));
            editingLayout.name = 'Personalizzato';
        }

        let selectedRowIdx = 0;
        let selectedKeyIdx = 0;

        // Group 1: Toolbar azioni
        const actionsGroup = new Adw.PreferencesGroup({
            title: _('Personalizzazione Layout Tastiera'),
            description: _('Modifica qualsiasi tasto, cambiane etichetta, dimensione flex, comportamento (normale o toggle ON/OFF), colori e posizione'),
        });
        page3.add(actionsGroup);

        // Responsive two-row action toolbar (fits in narrow floating windows without overflow)
        const mainToolbarBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 6,
            margin_top: 4,
            margin_bottom: 6,
            halign: Gtk.Align.CENTER,
        });

        const toolbarRow1 = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 8,
            halign: Gtk.Align.CENTER,
        });
        const resetItBtn = new Gtk.Button({ label: _('Reset Italiano') });
        resetItBtn.connect('clicked', () => {
            editingLayout = JSON.parse(JSON.stringify(Layouts.it));
            editingLayout.name = 'Personalizzato';
            selectedRowIdx = 0;
            selectedKeyIdx = 0;
            renderVisualKeyboard();
            updateInspector();
        });
        toolbarRow1.append(resetItBtn);

        const resetUsBtn = new Gtk.Button({ label: _('Reset USA') });
        resetUsBtn.connect('clicked', () => {
            editingLayout = JSON.parse(JSON.stringify(Layouts.us));
            editingLayout.name = 'Personalizzato';
            selectedRowIdx = 0;
            selectedKeyIdx = 0;
            renderVisualKeyboard();
            updateInspector();
        });
        toolbarRow1.append(resetUsBtn);
        mainToolbarBox.append(toolbarRow1);

        const toolbarRow2 = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 8,
            halign: Gtk.Align.CENTER,
        });
        const addKeyBtn = new Gtk.Button({
            label: _('+ Aggiungi Tasto'),
            css_classes: ['accent'],
        });
        addKeyBtn.connect('clicked', () => {
            const targetRow = (selectedRowIdx === 0)
                ? editingLayout.numberRow
                : editingLayout.mainRows[selectedRowIdx - 1];

            const newKey = {
                code: 0,
                label: 'Nuovo',
                shift: '',
                altgr: '',
                width: 1.0,
                type: 'char',
                behavior: 'normal',
                bgColor: '',
                textColor: '',
                activeColor: '',
            };
            targetRow.push(newKey);
            selectedKeyIdx = targetRow.length - 1;
            renderVisualKeyboard();
            updateInspector();
        });
        toolbarRow2.append(addKeyBtn);

        const deleteToolbarBtn = new Gtk.Button({
            label: _('- Elimina Tasto'),
            css_classes: ['destructive-action'],
        });
        deleteToolbarBtn.connect('clicked', () => {
            const row = getCurrentRow();
            if (row && row.length > 1) {
                row.splice(selectedKeyIdx, 1);
                selectedKeyIdx = Math.max(0, selectedKeyIdx - 1);
                renderVisualKeyboard();
                updateInspector();
            }
        });
        toolbarRow2.append(deleteToolbarBtn);

        const saveApplyBtn = new Gtk.Button({
            label: _('Salva ed Applica'),
            css_classes: ['suggested-action'],
        });
        saveApplyBtn.connect('clicked', () => {
            saveCustomLayout(editingLayout);
            settings.set_string('layout-variant', 'custom');
            // Bump token to trigger live reload in keyboard.js immediately!
            const token = (settings.get_int('custom-layout-token') || 0) + 1;
            settings.set_int('custom-layout-token', token);

            if (layoutSelectorRow) {
                layoutSelectorRow.selected = 2;
            }
            if (window.add_toast) {
                window.add_toast(new Adw.Toast({
                    title: _('Layout personalizzato salvato ed applicato live!'),
                }));
            }
        });
        toolbarRow2.append(saveApplyBtn);
        mainToolbarBox.append(toolbarRow2);

        const actionRow = new Adw.ActionRow();
        actionRow.set_child(mainToolbarBox);
        actionsGroup.add(actionRow);

        // Group 2: Anteprima Interattiva della Tastiera (Scrollable & Responsive)
        const previewGroup = new Adw.PreferencesGroup({
            title: _('Anteprima Interattiva (Clicca su un tasto per selezionarlo)'),
        });
        page3.add(previewGroup);

        const keyboardCanvas = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 3,
            margin_top: 4,
            margin_bottom: 4,
            margin_start: 4,
            margin_end: 4,
        });

        const canvasProvider = new Gtk.CssProvider();
        canvasProvider.load_from_string(`
            box {
                background-color: #1a1a1e;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 10px;
                padding: 6px 8px 8px 8px;
            }
        `);
        keyboardCanvas.get_style_context().add_provider(canvasProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

        const scrolledPreview = new Gtk.ScrolledWindow({
            hscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
            vscrollbar_policy: Gtk.PolicyType.NEVER,
            propagate_natural_width: true,
            min_content_height: 220,
            has_frame: false,
        });
        scrolledPreview.set_child(keyboardCanvas);

        const canvasContainer = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            margin_top: 4,
            margin_bottom: 4,
        });
        canvasContainer.append(scrolledPreview);

        const previewRow = new Adw.ActionRow();
        previewRow.set_child(canvasContainer);
        previewGroup.add(previewRow);

        // Group 3: Proprietà Tasto Selezionato (Inspector)
        const inspectorGroup = new Adw.PreferencesGroup({
            title: _('Proprietà Tasto Selezionato'),
            description: _('Modifica i valori del tasto selezionato nell\'anteprima sopra'),
        });
        page3.add(inspectorGroup);

        // Label Entry
        const labelRow = new Adw.EntryRow({
            title: _('Etichetta Principale (Label)'),
        });
        labelRow.connect('changed', () => {
            if (updatingInspector) return;
            const k = getSelectedKey();
            if (k) {
                k.label = labelRow.text;
                renderVisualKeyboard();
            }
        });
        inspectorGroup.add(labelRow);

        // Shift Entry
        const shiftRow = new Adw.EntryRow({
            title: _('Carattere con Maiusc (Shift)'),
        });
        shiftRow.connect('changed', () => {
            if (updatingInspector) return;
            const k = getSelectedKey();
            if (k) {
                k.shift = shiftRow.text;
            }
        });
        inspectorGroup.add(shiftRow);

        // AltGr Entry
        const altgrRow = new Adw.EntryRow({
            title: _('Carattere con Alt Gr'),
        });
        altgrRow.connect('changed', () => {
            if (updatingInspector) return;
            const k = getSelectedKey();
            if (k) {
                k.altgr = altgrRow.text;
            }
        });
        inspectorGroup.add(altgrRow);

        // Shift+AltGr Entry (for advanced Italian symbols like { and })
        const shiftAltgrRow = new Adw.EntryRow({
            title: _('Carattere con Maiusc + Alt Gr (Shift+AltGr)'),
        });
        shiftAltgrRow.connect('changed', () => {
            if (updatingInspector) return;
            const k = getSelectedKey();
            if (k) {
                k.shiftAltgr = shiftAltgrRow.text;
            }
        });
        inspectorGroup.add(shiftAltgrRow);

        // Key Width (Flex multiplier)
        const keyWidthRow = new Adw.SpinRow({
            title: _('Larghezza relativa (Unità Flex)'),
            subtitle: _('Dimensione orizzontale indipendente (es. 1.0 standard, 1.5 tab, 6.5 spazio)'),
            adjustment: new Gtk.Adjustment({
                lower: 0.4,
                upper: 8.0,
                step_increment: 0.1,
                page_increment: 0.5,
            }),
            digits: 2,
        });
        keyWidthRow.connect('notify::value', () => {
            if (updatingInspector) return;
            const k = getSelectedKey();
            if (k) {
                k.width = Math.round(keyWidthRow.value * 100) / 100;
                renderVisualKeyboard();
            }
        });
        inspectorGroup.add(keyWidthRow);

        // Key Linux Evdev Code
        const keycodeRow = new Adw.SpinRow({
            title: _('Codice Tasto Linux (Evdev Keycode)'),
            subtitle: _('Valore numerico del tasto (es. 16 per Q, 57 per Spazio, 14 per Backspace)'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 255,
                step_increment: 1,
            }),
        });
        keycodeRow.connect('notify::value', () => {
            if (updatingInspector) return;
            const k = getSelectedKey();
            if (k) {
                k.code = Math.round(keycodeRow.value);
            }
        });
        inspectorGroup.add(keycodeRow);

        // Behavior Mode (Normale vs Toggle ON/OFF)
        const behaviorRow = new Adw.ComboRow({
            title: _('Comportamento del Tasto'),
            subtitle: _('Scegli se il tasto funziona con tocco/pressione normale o come interruttore ON/OFF'),
            model: new Gtk.StringList({
                strings: ['Normale (Pressione / Ripetizione continua)', 'Switch ON/OFF (Attiva/Disattiva ad ogni tocco)']
            }),
        });
        behaviorRow.connect('notify::selected', () => {
            if (updatingInspector) return;
            const k = getSelectedKey();
            if (k) {
                k.behavior = (behaviorRow.selected === 1) ? 'toggle' : 'normal';
                renderVisualKeyboard();
            }
        });
        inspectorGroup.add(behaviorRow);

        // Custom Background Color Picker
        const bgPicker = createColorPickerRow(
            _('Colore di Sfondo Personalizzato'),
            _('Scegli con ruota colori e trasparenza (oppure clicca icona per default)'),
            (colorStr) => {
                if (updatingInspector) return;
                const k = getSelectedKey();
                if (k) {
                    k.bgColor = colorStr;
                    renderVisualKeyboard();
                }
            },
            () => {
                if (updatingInspector) return;
                const k = getSelectedKey();
                if (k) {
                    k.bgColor = '';
                    bgPicker.setColor('');
                    renderVisualKeyboard();
                }
            }
        );
        inspectorGroup.add(bgPicker.row);

        // Custom Text Color Picker
        const textPicker = createColorPickerRow(
            _('Colore del Testo / Etichetta'),
            _('Scegli il colore del simbolo visualizzato sul tasto'),
            (colorStr) => {
                if (updatingInspector) return;
                const k = getSelectedKey();
                if (k) {
                    k.textColor = colorStr;
                    renderVisualKeyboard();
                }
            },
            () => {
                if (updatingInspector) return;
                const k = getSelectedKey();
                if (k) {
                    k.textColor = '';
                    textPicker.setColor('');
                    renderVisualKeyboard();
                }
            }
        );
        inspectorGroup.add(textPicker.row);

        // Custom Pressed / Active Color Picker
        const activePicker = createColorPickerRow(
            _('Colore alla Pressione / Stato Attivo ON'),
            _('Colore quando il tasto viene premuto o attivato in modalità interruttore'),
            (colorStr) => {
                if (updatingInspector) return;
                const k = getSelectedKey();
                if (k) {
                    k.activeColor = colorStr;
                }
            },
            () => {
                if (updatingInspector) return;
                const k = getSelectedKey();
                if (k) {
                    k.activeColor = '';
                    activePicker.setColor('');
                }
            }
        );
        inspectorGroup.add(activePicker.row);

        // Responsive Move & Delete actions box
        const moveContainer = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 6,
            margin_top: 8,
            margin_bottom: 8,
            halign: Gtk.Align.CENTER,
        });

        const moveDirsBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 6,
            halign: Gtk.Align.CENTER,
        });

        const moveLeftBtn = new Gtk.Button({ label: _('<- Sinistra') });
        moveLeftBtn.connect('clicked', () => {
            const row = getCurrentRow();
            if (row && selectedKeyIdx > 0) {
                const temp = row[selectedKeyIdx];
                row[selectedKeyIdx] = row[selectedKeyIdx - 1];
                row[selectedKeyIdx - 1] = temp;
                selectedKeyIdx--;
                renderVisualKeyboard();
            }
        });
        moveDirsBox.append(moveLeftBtn);

        const moveRightBtn = new Gtk.Button({ label: _('-> Destra') });
        moveRightBtn.connect('clicked', () => {
            const row = getCurrentRow();
            if (row && selectedKeyIdx < row.length - 1) {
                const temp = row[selectedKeyIdx];
                row[selectedKeyIdx] = row[selectedKeyIdx + 1];
                row[selectedKeyIdx + 1] = temp;
                selectedKeyIdx++;
                renderVisualKeyboard();
            }
        });
        moveDirsBox.append(moveRightBtn);

        const moveUpBtn = new Gtk.Button({ label: _('^ Riga Sopra') });
        moveUpBtn.connect('clicked', () => {
            if (selectedRowIdx > 0) {
                const currRow = getCurrentRow();
                const [movedKey] = currRow.splice(selectedKeyIdx, 1);
                selectedRowIdx--;
                const targetRow = getCurrentRow();
                targetRow.push(movedKey);
                selectedKeyIdx = targetRow.length - 1;
                renderVisualKeyboard();
                updateInspector();
            }
        });
        moveDirsBox.append(moveUpBtn);

        const moveDownBtn = new Gtk.Button({ label: _('v Riga Sotto') });
        moveDownBtn.connect('clicked', () => {
            const maxRow = (editingLayout.mainRows ? editingLayout.mainRows.length : 4);
            if (selectedRowIdx < maxRow) {
                const currRow = getCurrentRow();
                const [movedKey] = currRow.splice(selectedKeyIdx, 1);
                selectedRowIdx++;
                const targetRow = getCurrentRow();
                targetRow.push(movedKey);
                selectedKeyIdx = targetRow.length - 1;
                renderVisualKeyboard();
                updateInspector();
            }
        });
        moveDirsBox.append(moveDownBtn);
        moveContainer.append(moveDirsBox);

        const moveActionRow = new Adw.ActionRow();
        moveActionRow.set_child(moveContainer);
        inspectorGroup.add(moveActionRow);

        // Helper functions for state
        function getCurrentRow() {
            if (selectedRowIdx === 0) {
                return editingLayout.numberRow;
            }
            if (editingLayout.mainRows && editingLayout.mainRows[selectedRowIdx - 1]) {
                return editingLayout.mainRows[selectedRowIdx - 1];
            }
            return null;
        }

        function getSelectedKey() {
            const row = getCurrentRow();
            if (row && row[selectedKeyIdx]) {
                return row[selectedKeyIdx];
            }
            return null;
        }

        let updatingInspector = false;
        function updateInspector() {
            const key = getSelectedKey();
            if (!key) return;

            updatingInspector = true;
            try {
                labelRow.text = key.label || '';
                shiftRow.text = key.shift || '';
                altgrRow.text = key.altgr || '';
                shiftAltgrRow.text = key.shiftAltgr || '';
                keyWidthRow.value = key.width || 1.0;
                keycodeRow.value = key.code || 0;
                behaviorRow.selected = (key.behavior === 'toggle') ? 1 : 0;
                bgPicker.setColor(key.bgColor || '');
                textPicker.setColor(key.textColor || '');
                activePicker.setColor(key.activeColor || '');
            } finally {
                updatingInspector = false;
            }
        }

        let previewShiftActive = false;
        let previewAltgrActive = false;
        let previewFnActive = false;

        function renderVisualKeyboard() {
            while (keyboardCanvas.get_first_child()) {
                keyboardCanvas.remove(keyboardCanvas.get_first_child());
            }

            // Realistic Mini Header
            const miniHeader = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                margin_bottom: 6,
                hexpand: true,
            });

            const layoutBadge = new Gtk.Label({
                label: `[${(editingLayout.name || 'Layout').toUpperCase()}]`,
                halign: Gtk.Align.START,
                valign: Gtk.Align.CENTER,
            });
            const badgeProvider = new Gtk.CssProvider();
            badgeProvider.load_from_string('label { font-size: 11px; font-weight: bold; color: rgba(255, 255, 255, 0.75); }');
            layoutBadge.get_style_context().add_provider(badgeProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
            miniHeader.append(layoutBadge);

            const handleBox = new Gtk.Box({
                hexpand: true,
                halign: Gtk.Align.CENTER,
                valign: Gtk.Align.CENTER,
            });
            const miniHandle = new Gtk.Box();
            miniHandle.set_size_request(56, 4);
            const handleProvider = new Gtk.CssProvider();
            handleProvider.load_from_string('box { background-color: rgba(255, 255, 255, 0.4); border-radius: 2px; }');
            miniHandle.get_style_context().add_provider(handleProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
            handleBox.append(miniHandle);
            miniHeader.append(handleBox);

            // Interactive modifier preview toggles & header simulation
            const previewControlsBox = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                spacing: 4,
                halign: Gtk.Align.END,
                valign: Gtk.Align.CENTER,
            });

            const makeSimToggle = (label, isActive, onToggle) => {
                const btn = new Gtk.Button({ label });
                const prov = new Gtk.CssProvider();
                prov.load_from_string(`
                    button {
                        background-color: ${isActive ? '#0078d4' : 'rgba(255, 255, 255, 0.08)'};
                        color: ${isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.75)'};
                        font-size: 10px;
                        font-weight: ${isActive ? 'bold' : 'normal'};
                        border: 1px solid ${isActive ? '#2b88d8' : 'rgba(255, 255, 255, 0.14)'};
                        border-radius: 4px;
                        padding: 2px 6px;
                    }
                `);
                btn.get_style_context().add_provider(prov, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
                btn.connect('clicked', onToggle);
                return btn;
            };

            const shiftSimBtn = makeSimToggle('Maiusc', previewShiftActive, () => {
                previewShiftActive = !previewShiftActive;
                renderVisualKeyboard();
            });
            previewControlsBox.append(shiftSimBtn);

            const altgrSimBtn = makeSimToggle('AltGr', previewAltgrActive, () => {
                previewAltgrActive = !previewAltgrActive;
                renderVisualKeyboard();
            });
            previewControlsBox.append(altgrSimBtn);

            const fnSimBtn = makeSimToggle('FN', previewFnActive, () => {
                previewFnActive = !previewFnActive;
                renderVisualKeyboard();
            });
            previewControlsBox.append(fnSimBtn);

            const dummyControls = new Gtk.Label({
                label: '[Dock] [X]',
                halign: Gtk.Align.END,
                valign: Gtk.Align.CENTER,
            });
            const dummyProv = new Gtk.CssProvider();
            dummyProv.load_from_string('label { font-size: 10px; color: rgba(255, 255, 255, 0.45); margin-left: 4px; }');
            dummyControls.get_style_context().add_provider(dummyProv, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
            previewControlsBox.append(dummyControls);

            miniHeader.append(previewControlsBox);
            keyboardCanvas.append(miniHeader);

            // Assemble rows
            const allRows = [];
            if (editingLayout.numberRow) {
                allRows.push(editingLayout.numberRow);
            }
            if (editingLayout.mainRows) {
                for (const r of editingLayout.mainRows) {
                    allRows.push(r);
                }
            }

            for (let r = 0; r < allRows.length; r++) {
                const rowDef = allRows[r];
                const isNumRow = (r === 0);
                const rowBox = new Gtk.Box({
                    orientation: Gtk.Orientation.HORIZONTAL,
                    spacing: 4,
                    hexpand: true,
                    margin_bottom: isNumRow ? 6 : 4,
                });

                if (isNumRow) {
                    const numRowProv = new Gtk.CssProvider();
                    numRowProv.load_from_string('box { border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 4px; }');
                    rowBox.get_style_context().add_provider(numRowProv, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
                }

                for (let k = 0; k < rowDef.length; k++) {
                    const keyDef = rowDef[k];
                    const isSelected = (r === selectedRowIdx && k === selectedKeyIdx);

                    let targetLabel = keyDef.label || '';
                    let modTone = null; // 'shift', 'altgr', 'both', 'fn'

                    if (previewFnActive && isNumRow) {
                        const fnMap = {
                            2: 'F1', 3: 'F2', 4: 'F3', 5: 'F4', 6: 'F5', 7: 'F6',
                            8: 'F7', 9: 'F8', 10: 'F9', 11: 'F10', 12: 'F11', 13: 'F12'
                        };
                        targetLabel = fnMap[keyDef.code] || `F${k + 1}`;
                        modTone = 'fn';
                    } else if (previewShiftActive && previewAltgrActive && keyDef.shiftAltgr) {
                        targetLabel = keyDef.shiftAltgr;
                        modTone = 'both';
                    } else if (previewAltgrActive && keyDef.altgr) {
                        targetLabel = keyDef.altgr;
                        modTone = 'altgr';
                    } else if (previewShiftActive && keyDef.shift) {
                        targetLabel = keyDef.shift;
                        if (!(keyDef.label && keyDef.label.length === 1 && keyDef.label.match(/[a-z]/i))) {
                            modTone = 'shift';
                        }
                    } else if (previewShiftActive && keyDef.label && keyDef.label.length === 1 && keyDef.label.match(/[a-z]/i)) {
                        targetLabel = keyDef.shift || keyDef.label.toUpperCase();
                    } else {
                        targetLabel = keyDef.label || '';
                    }

                    const isEnterTop = (keyDef.type === 'enter' && keyDef.enterPart === 'top');
                    const isEnterBottom = (keyDef.type === 'enter' && keyDef.enterPart === 'bottom');

                    if (keyDef.type === 'enter') {
                        if (previewShiftActive) {
                            targetLabel = isEnterBottom ? '↵' : '↵ A capo';
                        } else {
                            targetLabel = keyDef.label || (isEnterBottom ? '↵' : 'Invio ↵');
                        }
                    }

                    const btn = new Gtk.Button({
                        hexpand: false,
                        can_focus: false,
                    });

                    const baseWidth = Math.max(26, Math.round((keyDef.width || 1.0) * 36));
                    let baseHeight = isNumRow ? 32 : 36;
                    if (isEnterTop) {
                        baseHeight = 36 + 4;
                    }
                    btn.set_size_request(baseWidth, baseHeight);

                    const singleLbl = new Gtk.Label({
                        label: targetLabel || ' ',
                        halign: Gtk.Align.CENTER,
                        valign: Gtk.Align.CENTER,
                    });
                    const isSingleChar = (targetLabel.length === 1);
                    const customFont = (settings.get_string('font-family') || '').trim();
                    const previewFontFamily = customFont ? `"${customFont}", "Atkinson Hyperlegible Next", "Atkinson Hyperlegible", sans-serif` : '"Atkinson Hyperlegible Next", "Atkinson Hyperlegible", sans-serif';
                    const lblProv = new Gtk.CssProvider();
                    lblProv.load_from_string(`label { font-family: ${previewFontFamily}; font-size: ${isSingleChar ? '13px' : '10px'}; font-weight: ${modTone || isSelected ? '700' : '500'}; }`);
                    singleLbl.get_style_context().add_provider(lblProv, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
                    btn.set_child(singleLbl);

                    // Keycap styling matching authentic OSK
                    let bg = keyDef.bgColor || 'rgba(255, 255, 255, 0.08)';
                    let border = '1px solid rgba(255, 255, 255, 0.08)';
                    let borderTop = '1px solid rgba(255, 255, 255, 0.14)';
                    let borderBottom = '2px solid rgba(0, 0, 0, 0.45)';
                    let borderRadius = '6px';
                    let color = keyDef.textColor || '#f3f3f3';
                    let boxShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';

                    if (isEnterTop) {
                        borderRadius = '6px 6px 0 4px';
                        borderBottom = 'none';
                    } else if (isEnterBottom) {
                        borderRadius = '0 0 6px 6px';
                        borderTop = 'none';
                    }

                    if (keyDef.type === 'enter') {
                        if (previewShiftActive) {
                            bg = 'rgba(70, 135, 195, 0.40)';
                            border = '1px solid rgba(160, 205, 255, 0.65)';
                            color = '#edf5ff';
                            boxShadow = '0 0 6px rgba(0, 120, 212, 0.40)';
                        } else {
                            bg = keyDef.bgColor || 'rgba(0, 120, 212, 0.22)';
                            border = '1px solid rgba(0, 120, 212, 0.45)';
                            color = keyDef.textColor || '#60cdff';
                        }
                    } else if (keyDef.type === 'shift' && previewShiftActive) {
                        bg = '#0078d4';
                        border = '1px solid #2b88d8';
                        color = '#ffffff';
                        boxShadow = '0 0 8px rgba(0, 120, 212, 0.6)';
                    } else if (keyDef.type === 'altgr' && previewAltgrActive) {
                        bg = '#0078d4';
                        border = '1px solid #2b88d8';
                        color = '#ffffff';
                        boxShadow = '0 0 8px rgba(0, 120, 212, 0.6)';
                    } else if (keyDef.type === 'fn_toggle' && previewFnActive) {
                        bg = '#0078d4';
                        border = '1px solid #2b88d8';
                        color = '#ffffff';
                        boxShadow = '0 0 8px rgba(0, 120, 212, 0.6)';
                    } else if (modTone === 'both') {
                        bg = 'rgba(75, 120, 90, 0.58)';
                        border = '1px solid rgba(140, 215, 165, 0.35)';
                        borderTop = '1px solid rgba(140, 215, 165, 0.50)';
                        color = '#ffffff';
                        boxShadow = '0 0 6px rgba(80, 160, 110, 0.35)';
                    } else if (modTone === 'altgr') {
                        bg = 'rgba(45, 75, 55, 0.52)';
                        border = '1px solid rgba(110, 175, 130, 0.22)';
                        borderTop = '1px solid rgba(110, 175, 130, 0.38)';
                        color = '#f0faf2';
                    } else if (modTone === 'shift') {
                        bg = 'rgba(255, 255, 255, 0.16)';
                        borderTop = '1px solid rgba(255, 255, 255, 0.28)';
                        color = '#ffffff';
                    } else if (modTone === 'fn') {
                        bg = 'rgba(255, 255, 255, 0.18)';
                        borderTop = '1px solid rgba(255, 255, 255, 0.30)';
                        color = '#ffffff';
                    } else if (['shift', 'caps', 'altgr', 'ctrl', 'alt', 'fn_toggle', 'tab'].includes(keyDef.type)) {
                        bg = keyDef.bgColor || 'rgba(255, 255, 255, 0.04)';
                        color = keyDef.textColor || 'rgba(255, 255, 255, 0.85)';
                    } else {
                        bg = keyDef.bgColor || 'rgba(255, 255, 255, 0.08)';
                    }

                    if (isSelected) {
                        boxShadow = '0 0 8px rgba(0, 120, 212, 0.9)';
                        border = '2px solid #60cdff';
                    }

                    const btnProvider = new Gtk.CssProvider();
                    const css = `
                        button {
                            background-color: ${bg};
                            background-image: none;
                            border: ${border};
                            border-top: ${borderTop};
                            border-bottom: ${borderBottom};
                            border-radius: ${borderRadius};
                            color: ${color};
                            padding: 0;
                            box-shadow: ${boxShadow};
                        }
                    `;
                    btnProvider.load_from_string(css);
                    btn.get_style_context().add_provider(btnProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

                    const thisRow = r;
                    const thisKey = k;
                    btn.connect('clicked', () => {
                        selectedRowIdx = thisRow;
                        selectedKeyIdx = thisKey;
                        renderVisualKeyboard();
                        updateInspector();
                    });

                    rowBox.append(btn);
                }
                keyboardCanvas.append(rowBox);
            }
        }

        // Initial render
        renderVisualKeyboard();
        updateInspector();

        settings.connect('changed::font-family', () => {
            renderVisualKeyboard();
        });
    }
}
