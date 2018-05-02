import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class VisionSettings extends PolymerElement {
    static get template() {
        return html`
      <div>Vision Settings</div>
    `;
    }
}

customElements.define('vision-settings', VisionSettings);
