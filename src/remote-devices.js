import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class RemoteDevices extends PolymerElement {
    static get template() {
        return html`
      <div>Remote Devices</div>
    `;
    }
}

customElements.define('remote-devices', RemoteDevices);
