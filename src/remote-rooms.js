import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class RemoteRooms extends PolymerElement {
    static get template() {
        return html`
      <div>Remote Rooms</div>
    `;
    }
}

customElements.define('remote-rooms', RemoteRooms);
