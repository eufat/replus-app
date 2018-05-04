import {
    PolymerElement,
    html,
} from '/node_modules/@polymer/polymer/polymer-element.js';
import PolymerRedux from '/node_modules/polymer-redux/polymer-redux.js';

import '/node_modules/@polymer/paper-toggle-button/paper-toggle-button.js';
import '/node_modules/@polymer/paper-button/paper-button.js';
import '/node_modules/@polymer/paper-item/paper-item.js';
import '/node_modules/@polymer/paper-dialog/paper-dialog.js';
import '/node_modules/@polymer/paper-radio-group/paper-radio-group.js';
import '/node_modules/@polymer/paper-radio-button/paper-radio-button.js';

import store from './store.js';
import actions from './vision-actions.js';
const ReduxMixin = PolymerRedux(store);

export default class VisionSettings extends ReduxMixin(PolymerElement) {
    constructor() {
        super();

        const initialSettings = {
            resolution: 0,
            rotation: 0,
            lamp: false,
            motion: false,
            update: false,
        };

        this.settings = initialSettings;
    }

    static get actions() {
        return actions;
    }

    static get properties() {
        return {
            resolutions: {
                type: Array,
                value: ['320p', '480p', '720p', '1080p'],
            },
            rotations: {
                type: Array,
                value: ['0°', '90°', '180°', '270°'],
            },
            settingsIsDisabled: Boolean,
            off: Boolean,
            restart: Boolean,
            settings: {
                type: Object,
            },
        };
    }

    static get observers() {
        return ['offOrRestartIsChanged(off, restart)'];
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
        this.dispatch('setSettings', this.settings);
    }

    openResolutionDialog() {
        this.$.resolutionDialog.open();
    }

    openRotationDialog() {
        this.$.rotationDialog.open();
    }

    openTurnOffDialog() {
        this.$.turnOffDialog.open();
    }

    openRestartDialog() {
        this.$.restartDialog.open();
    }

    onTurnOffDevice() {
        this.off = true;
        this.handleSaveSettings();
    }

    onRestartDevice() {
        this.restart = true;
        this.handleSaveSettings();
    }

    static get template() {
        return html`
        <style>
            .command {
                border-bottom: 1px solid #ECEFF1;
            }
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
        <div role="listbox" class="command">
            <paper-item on-tap="openTurnOffDialog">
                <paper-item-body>
                    <div>Turn Off Device</div>
                </paper-item-body>
            </paper-item>
            <paper-item  on-tap="openRestartDialog">
                <paper-item-body>
                    <div>Restart Device</div>
                </paper-item-body>
            </paper-item>
        </div>
        <div role="listbox" class="settings">
            <paper-item>
                <paper-item-body>
                    <div>Light</div>
                </paper-item-body>
                <paper-toggle-button disabled$="[[settingsIsDisabled]]" checked="{{settings.lamp}}" class="settings-right"></paper-toggle-button>
            </paper-item>
            <paper-item>
                <paper-item-body>
                    <div>Motion Detection</div>
                </paper-item-body>
                <paper-toggle-button disabled$="[[settingsIsDisabled]]" checked="{{settings.motion}}" class="settings-right"></paper-toggle-button>
            </paper-item>
            <paper-item>
                <paper-item-body>
                    <div>Auto Update</div>
                </paper-item-body>
                <paper-toggle-button disabled$="[[settingsIsDisabled]]" checked="{{settings.update}}" class="settings-right"></paper-toggle-button>
            </paper-item>
            <paper-item on-tap="openResolutionDialog">
                <paper-item-body>
                    <div>Image Resolution</div>
                </paper-item-body>
                <div class="settings-right">{{getResolution(settings.resolution)}}</div>
            </paper-item>
            <paper-item on-tap="openRotationDialog">
                <paper-item-body>
                    <div>Image Rotation</div>
                </paper-item-body>
                <div class="settings-right">{{getRotation(settings.rotation)}}</div>
            </paper-item>
            <paper-button  disabled$="[[settingsIsDisabled]]" class="save" raised on-tap="handleSaveSettings">Save Settings</paper-button>
        </div>
        <paper-dialog id="resolutionDialog">
            <paper-radio-group selected="{{settings.resolution}}">
                <template is="dom-repeat" items="{{resolutions}}">
                    <paper-radio-button  disabled$="[[settingsIsDisabled]]" name="{{getIndexOf(resolutions, item)}}">{{item}}</paper-radio-button>
                </template>
            </paper-radio-group>
        </paper-dialog>
        <paper-dialog id="rotationDialog">
            <paper-radio-group selected="{{settings.rotation}}">
                <template is="dom-repeat" items="{{rotations}}">
                    <paper-radio-button  disabled$="[[settingsIsDisabled]]" name="{{getIndexOf(rotations, item)}}">{{item}}</paper-radio-button>
                </template>
            </paper-radio-group>
        </paper-dialog>
        <paper-dialog id="turnOffDialog">
            <p>Are you sure you want to turn off the device?</p>
            <div class="buttons">
                <paper-button dialog-dismiss>Cancel</paper-button>
                <paper-button dialog-confirm autofocus on-tap="onTurnOffDevice">Turn Off</paper-button>
            </div>
        </paper-dialog>
        <paper-dialog id="restartDialog">
            <p>Are you sure you want to restart the device?</p>
            <div class="buttons">
                <paper-button dialog-dismiss>Cancel</paper-button>
                <paper-button dialog-confirm autofocus on-tap="onRestartDevice">Restart</paper-button>
            </div>
        </paper-dialog>
    `;
    }
}

customElements.define('vision-settings', VisionSettings);
