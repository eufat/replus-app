import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class ReplusVisionEvents extends PolymerElement {
    static get template() {
        return html`
      <div>Vision Events</div>
    `;
    }
}

customElements.define('rs-vision-events', ReplusVisionEvents);
