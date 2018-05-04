import {PolymerElement, html} from '/node_modules/@polymer/polymer/polymer-element.js';

import '/node_modules/@polymer/paper-toggle-button/paper-toggle-button.js';
import '/node_modules/@polymer/paper-button/paper-button.js';
import '/node_modules/@polymer/paper-item/paper-item.js';
import '/node_modules/@polymer/paper-dialog/paper-dialog.js';
import '/node_modules/@polymer/paper-radio-group/paper-radio-group.js';
import '/node_modules/@polymer/paper-radio-button/paper-radio-button.js';

export default class VisionSettings extends PolymerElement {
    static get properties() {
        return {
            resolutions: {
                type: Array,
                value: ['320p', '480p', '720p', '1080p'],
            },
            rotations: {
                type: Array,
                value: ['0°', '180°'],
            },
            resolution: Number,
            rotation: Number,
            light: Boolean,
            motion: Boolean,
            update: Boolean,
        };
    }

    ready() {
        super.ready();
        this.resolution = 0;
        this.rotation = 0;
        this.light = false;
        this.motion = false;
        this.update = false;
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

    _onSaveSettings() {
        const settings = {
            resolution: this.resolution,
            rotation: this.rotation,
            light: this.light,
            motion: this.motion,
            update: this.update,
        };
        console.log('settings', settings);
    }

    _openResolutionDialog() {
        this.$.resolutionDialog.open();
    }

    _openRotationDialog() {
        this.$.rotationDialog.open();
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
            <paper-item>
                <paper-item-body>
                    <div>Turn Off Device</div>
                </paper-item-body>
            </paper-item>
            <paper-item>
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
                <paper-toggle-button checked="{{light}}" class="settings-right"></paper-toggle-button>
            </paper-item>
            <paper-item>
                <paper-item-body>
                    <div>Motion Detection</div>
                </paper-item-body>
                <paper-toggle-button checked="{{motion}}" class="settings-right"></paper-toggle-button>
            </paper-item>
            <paper-item>
                <paper-item-body>
                    <div>Auto Update</div>
                </paper-item-body>
                <paper-toggle-button checked="{{update}}" class="settings-right"></paper-toggle-button>
            </paper-item>
            <paper-item on-tap="_openResolutionDialog">
                <paper-item-body>
                    <div>Image Resolution</div>
                </paper-item-body>
                <div class="settings-right">{{getResolution(resolution)}}</div>
            </paper-item>
            <paper-item on-tap="_openRotationDialog">
                <paper-item-body>
                    <div>Image Rotation</div>
                </paper-item-body>
                <div class="settings-right">{{getRotation(rotation)}}</div>
            </paper-item>
            <paper-button class="save" raised on-tap="_onSaveSettings">Save Settings</paper-button>
        </div>
        <paper-dialog id="resolutionDialog">
            <paper-radio-group selected="{{resolution}}">
                <template is="dom-repeat" items="{{resolutions}}">
                    <paper-radio-button name="{{getIndexOf(resolutions, item)}}">{{item}}</paper-radio-button>
                </template>
            </paper-radio-group>
        </paper-dialog>
        <paper-dialog id="rotationDialog">
            <paper-radio-group selected="{{rotation}}">
                <template is="dom-repeat" items="{{rotations}}">
                    <paper-radio-button name="{{getIndexOf(rotations, item)}}">{{item}}</paper-radio-button>
                </template>
            </paper-radio-group>
        </paper-dialog>
    `;
    }
}

customElements.define('vision-settings', VisionSettings);
