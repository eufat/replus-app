import {PolymerElement, html} from '/node_modules/@polymer/polymer/polymer-element.js';

export default class RemoteRooms extends PolymerElement {
    static get template() {
        return html`
      <div>Remote Rooms</div>
    `;
    }
}

customElements.define('remote-rooms', RemoteRooms);
