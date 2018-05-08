import {PolymerElement, html} from '/node_modules/@polymer/polymer/polymer-element.js';

export default class RemoteSettings extends PolymerElement {
    static get template() {
        return html`
      <div>Remote Settings</div>
    `;
    }
}

customElements.define('remote-settings', RemoteSettings);
