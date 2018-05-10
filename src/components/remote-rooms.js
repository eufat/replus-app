import {LitElement, html} from '@polymer/lit-element';

export default class RemoteRooms extends LitElement {
    _render() {
        return html`
      <div>Remote Rooms</div>
    `;
    }
}

customElements.define('remote-rooms', RemoteRooms);
