import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class ReplusVisionSettings extends PolymerElement {
    static get template() {
        return html`
      <div>Vision Settings</div>
    `;
    }
}

customElements.define('rs-vision-settings', ReplusVisionSettings);
