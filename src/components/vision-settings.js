import {LitElement, html} from '@polymer/lit-element';

import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';

import {store} from '../store.js';
import {setSettings, saveSettings} from '../actions/vision.js';
import {connect} from 'pwa-helpers/connect-mixin.js';

export default class VisionSettings extends connect(store)(LitElement) {
    static get properties() {
        return {
            resolutions: Array,
            rotations: Array,
            settingsIsDisabled: Boolean,
            off: Boolean,
            restart: Boolean,
            settings: Object,
        };
    }

    constructor() {
        super();
        this.resolutions = ['320p', '480p', '720p', '1080p'];
        this.rotations = ['0°', '90°', '180°', '270°'];
        this.settingsIsDisabled = false;
        this.settings = {
            resolution: 0,
            rotation: 0,
            lamp: false,
            motion: false,
            update: false,
        };

        store.dispatch(setSettings(this.settings));
    }

    _stateChanged(state) {
        this.settings = state.vision.settings;
    }

    getResolution(resolution) {
        return this.resolutions[resolution];
    }

    getRotation(rotation) {
        return this.rotations[rotation];
    }

    getIndexOf(array, element) {
        return array.indexOf(element);
    }

    offOrRestartIsChanged(off, restart) {
        this.settingsIsDisabled = off || restart;
    }

    handleSaveSettings() {
        store.dispatch(saveSettings(this.settings));
    }

    toggleSettings(key) {
        this.settings = {...this.settings, [key]: !this.settings[key]};
        store.dispatch(setSettings(this.settings));
    }

    changeSettings(event, key) {
        const value = event.target.name;
        this.settings = {...this.settings, [key]: value};
        store.dispatch(setSettings(this.settings));
    }

    _render({settings, resolutions, settingsIsDisabled, rotations}) {
        const {
            getIndexOf,
            onTurnOffDevice,
            handleSaveSettings,
            onRestartDevice,
        } = this;

        const settingsResolution = resolutions[settings.resolution];
        const settingsRotation = rotations[settings.rotation];

        return html`
        <style>
            .settings {
                border-bottom: 1px solid #ECEFF1;
            }
            .settings-right {
                margin-left: auto;
                margin-right: 0;
            }

            paper-button.save {
                margin: 1em;
                background-color: white;
                color: black;
            }
            paper-button.save:hover {
                background-color: var(--paper-grey-50);
            }
            paper-radio-button {
                width: 100%;
                margin: 0;
            }
        </style>
        <div role="listbox" class="settings">
            <paper-item on-click="${() => this.toggleSettings('lamp')}">
                <paper-item-body>
                    <div>Lamp</div>
                </paper-item-body>
                <paper-toggle-button
                    checked="${settings.lamp}"
                    class="settings-right">
                </paper-toggle-button>
            </paper-item>
            <paper-item on-click="${() => this.toggleSettings('motion')}">
                <paper-item-body>
                    <div>Motion Detection</div>
                </paper-item-body>
                <paper-toggle-button
                    checked="${settings.motion}"
                    class="settings-right">
                </paper-toggle-button>
            </paper-item>
            <paper-item on-click="${() => this.toggleSettings('update')}">
                <paper-item-body>
                    <div>Auto Update</div>
                </paper-item-body>
                <paper-toggle-button
                    checked="${settings.update}"
                    class="settings-right">
                </paper-toggle-button>
            </paper-item>
            <paper-item on-click="${() =>
                this.shadowRoot.getElementById('resolutionDialog').open()}">
                <paper-item-body>
                    <div>Image Resolution</div>
                </paper-item-body>
                <div class="settings-right">
                    ${settingsResolution}
                </div>
            </paper-item>
            <paper-item on-click="${() =>
                this.shadowRoot.getElementById('rotationDialog').open()}">
                <paper-item-body>
                    <div>Image Rotation</div>
                </paper-item-body>
                <div class="settings-right">
                    ${settingsRotation}
                </div>
            </paper-item>
            <paper-button
                class="save"
                raised
                on-click="${() => handleSaveSettings()}">
                    Save Settings
            </paper-button>
        </div>
        <paper-dialog id="resolutionDialog">
            <paper-radio-group
                selected="${settings.resolution}"
                on-change="${(e) => this.changeSettings(e, 'resolution')}"
            >
                ${resolutions.map(
                    (item) => html`
                        <paper-radio-button
                            name="${this.getIndexOf(resolutions, item)}">
                                ${item}
                        </paper-radio-button>
                    `
                )}
            </paper-radio-group>
        </paper-dialog>
        <paper-dialog id="rotationDialog">
            <paper-radio-group
                selected="${settings.rotation}"
                on-change="${(e) => this.changeSettings(e, 'rotation')}"
            >
            ${rotations.map(
                (item) => html`
                        <paper-radio-button
                            name="${getIndexOf(rotations, item)}">
                                ${item}
                        </paper-radio-button>
                    `
            )}
            </paper-radio-group>
        </paper-dialog>
        <paper-dialog id="turnOffDialog">
            <p>Are you sure you want to turn off the device?</p>
            <div class="buttons">
                <paper-button dialog-dismiss>Cancel</paper-button>
                <paper-button
                    dialog-confirm
                    autofocus
                    on-click="${() => onTurnOffDevice()}">
                        Turn Off
                </paper-button>
            </div>
        </paper-dialog>
        <paper-dialog id="restartDialog">
            <p>Are you sure you want to restart the device?</p>
            <div class="buttons">
                <paper-button dialog-dismiss>Cancel</paper-button>
                <paper-button
                    dialog-confirm
                    autofocus
                    on-click="${() => onRestartDevice()}">
                        Turn Off
                </paper-button>
            </div>
        </paper-dialog>
    `;
    }
}

customElements.define('vision-settings', VisionSettings);
