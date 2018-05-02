import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class ReplusRemoteSettings extends PolymerElement {
    static get template() {
        return html`
      <div>Remote Settings</div>
    `;
    }
}

customElements.define('rs-remote-settings', ReplusRemoteSettings);
