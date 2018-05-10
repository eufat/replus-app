import {LitElement, html} from '@polymer/lit-element';

export default class RemoteSettings extends LitElement {
    _render() {
        return html`
      <div>Remote Settings</div>
    `;
    }
}

customElements.define('remote-settings', RemoteSettings);
