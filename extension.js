import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { VirtualInput } from './input.js';

const FluentQuickToggle = GObject.registerClass(
class FluentQuickToggle extends QuickSettings.QuickToggle {
    _init(extension) {
        super._init({
            title: _('Tastiera Fluent'),
            subtitle: _('Spenta'),
            iconName: 'input-keyboard-symbolic',
            toggleMode: true,
        });

        this._extension = extension;
        this.connect('clicked', () => {
            if (this._extension.keyboard) {
                this._extension.keyboard.toggle();
            }
        });
    }

    setActive(active) {
        this.checked = active;
        this.subtitle = active ? _('Accesa') : _('Spenta');
    }
});

export default class FluentOskExtension extends Extension {
    async enable() {
        this._settings = this.getSettings();
        this._input = new VirtualInput();

        // Bypass cache ESM tramite symlink univoco a runtime
        const ver = Date.now();
        const symName = `keyboard_rt_${ver}.js`;
        const symPath = GLib.build_filenamev([this.path, symName]);
        const targetPath = GLib.build_filenamev([this.path, 'keyboard.js']);

        try {
            const dir = Gio.File.new_for_path(this.path);
            const iter = dir.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
            let info;
            while ((info = iter.next_file(null)) !== null) {
                const name = info.get_name();
                if (name.startsWith('keyboard_rt_') && name.endsWith('.js')) {
                    dir.get_child(name).delete(null);
                }
            }
        } catch (e) {}

        try {
            const sym = Gio.File.new_for_path(symPath);
            sym.make_symbolic_link(targetPath, null);
            this._rtSymlink = sym;
        } catch (e) {}

        const { FluentKeyboard } = await import(`./${symName}`);
        this.keyboard = new FluentKeyboard(this._settings, this._input, this);

        // Build top panel button
        if (this._settings.get_boolean('show-panel-button')) {
            this._buildPanelButton();
        }

        // Build QuickSettings tile
        this._buildQuickToggle();

        this._settingsListener = this._settings.connect('changed::keyboard-visible', () => {
            const visible = this._settings.get_boolean('keyboard-visible');
            if (visible && !this.keyboard.isOpen) {
                this.keyboard.open();
            } else if (!visible && this.keyboard.isOpen) {
                this.keyboard.close();
            }
        });

        // Avvio: OSK nascosto a riposo
        this._settings.set_boolean('keyboard-visible', false);
        this.updateToggleState(false);
    }

    _buildPanelButton() {
        this._indicator = new PanelMenu.Button(0.0, 'Fluent OSK', true);

        // Rimozione click gesture stock per propagazione diretta
        if (this._indicator._clickGesture) {
            this._indicator.remove_action(this._indicator._clickGesture);
        }

        this._icon = new St.Icon({
            icon_name: 'input-keyboard-symbolic',
            style_class: 'system-status-icon',
        });
        this._indicator.add_child(this._icon);

        this._indicator.connect('button-press-event', (actor, event) => {
            if (event.get_button() === 1) {
                if (this.keyboard) {
                    this.keyboard.toggle();
                }
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });

        this._indicator.connect('touch-event', (actor, event) => {
            const type = event.type();
            if (type === Clutter.EventType.TOUCH_BEGIN) {
                return Clutter.EVENT_STOP;
            }
            if (type === Clutter.EventType.TOUCH_END) {
                if (this.keyboard) {
                    this.keyboard.toggle();
                }
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });

        Main.panel.addToStatusArea('fluent-osk-indicator', this._indicator);
    }

    _buildQuickToggle() {
        try {
            this._quickIndicator = new QuickSettings.SystemIndicator();
            this._quickToggle = new FluentQuickToggle(this);
            this._quickIndicator.quickSettingsItems.push(this._quickToggle);
            Main.panel.statusArea.quickSettings.addExternalIndicator(this._quickIndicator);
        } catch (e) {
            console.warn('[FluentOSK] Could not add QuickSettings tile:', e);
        }
    }

    updateToggleState(isOpen) {
        if (this._indicator) {
            if (isOpen) {
                this._indicator.add_style_pseudo_class('active');
                this._indicator.add_style_pseudo_class('checked');
                this._indicator.add_style_class_name('fluent-osk-btn-active');
            } else {
                this._indicator.remove_style_pseudo_class('active');
                this._indicator.remove_style_pseudo_class('checked');
                this._indicator.remove_style_class_name('fluent-osk-btn-active');
            }
        }

        if (this._quickToggle) {
            this._quickToggle.setActive(isOpen);
        }
    }

    disable() {
        if (this._settingsListener) {
            this._settings.disconnect(this._settingsListener);
            this._settingsListener = null;
        }

        if (this._quickToggle) {
            this._quickToggle.destroy();
            this._quickToggle = null;
        }

        if (this._quickIndicator) {
            this._quickIndicator.destroy();
            this._quickIndicator = null;
        }

        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        if (this.keyboard) {
            this.keyboard.destroy();
            this.keyboard = null;
        }

        if (this._input) {
            this._input.destroy();
            this._input = null;
        }

        if (this._rtSymlink) {
            try {
                this._rtSymlink.delete(null);
            } catch (e) {}
            this._rtSymlink = null;
        }

        this._settings = null;
    }
}
