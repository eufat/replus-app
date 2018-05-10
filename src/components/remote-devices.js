import {LitElement, html} from '@polymer/lit-element';

export default class RemoteDevices extends LitElement {
    _render() {
        return html`
      <div>Remote Devices</div>
    `;
    }
}

customElements.define('remote-devices', RemoteDevices);
