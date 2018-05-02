import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class RemoteSettings extends PolymerElement {
    static get template() {
        return html`
      <div>Remote Settings</div>
    `;
    }
}

customElements.define('remote-settings', RemoteSettings);
