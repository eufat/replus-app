import {PolymerElement, html} from '@polymer/polymer/polymer-element';

import '@polymer/paper-toggle-button/paper-toggle-button';

export default class VisionSettings extends PolymerElement {
    static get template() {
        return html`
        <style>
            .settings-toggle {
                margin-left: auto;
                margin-right: 0;
            }
        </style>
        <div role="listbox">
            <paper-item>
                <paper-item-body>
                    <div>Light</div>
                </paper-item-body>
                <paper-toggle-button checked class="settings-toggle"></paper-toggle-button>
            </paper-item>
            <paper-item>
                <paper-item-body>
                    <div>Motion Detection</div>
                </paper-item-body>
                <paper-toggle-button checked class="settings-toggle"></paper-toggle-button>
            </paper-item>
            <paper-item>
                <paper-item-body>
                    <div>Auto Update</div>
                </paper-item-body>
                <paper-toggle-button checked class="settings-toggle"></paper-toggle-button>
            </paper-item>
            <paper-item>
                <paper-item-body>
                    <div>Image Resolution</div>
                </paper-item-body>
            </paper-item>
            <paper-item>
                <paper-item-body>
                    <div>Image Rotation</div>
                </paper-item-body>
            </paper-item>
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
    `;
    }
}

customElements.define('vision-settings', VisionSettings);
