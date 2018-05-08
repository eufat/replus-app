import {PolymerElement, html} from '/node_modules/@polymer/polymer/polymer-element.js';

export default class RemoteDevices extends PolymerElement {
    static get template() {
        return html`
      <div>Remote Devices</div>
    `;
    }
}

customElements.define('remote-devices', RemoteDevices);
