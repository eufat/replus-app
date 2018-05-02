import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class ReplusRemoteDevices extends PolymerElement {
    static get template() {
        return html`
      <div>Remote Devices</div>
    `;
    }
}

customElements.define('rs-remote-devices', ReplusRemoteDevices);
