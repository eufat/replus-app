import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class ReplusRemoteRooms extends PolymerElement {
    static get template() {
        return html`
      <div>Remote Rooms</div>
    `;
    }
}

customElements.define('rs-remote-rooms', ReplusRemoteRooms);
