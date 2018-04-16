import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/app-route/app-location';
import '@polymer/app-route/app-route';

import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-selector/iron-selector';

export default class ReplusRoute extends PolymerElement {
    static get properties() {
        return {
            route: Object,
            subRoute: Object,
            routeData: Object,
        };
    }

    static get template() {
        return html`
      <app-location route="{{route}}"></app-location>
      <app-route
          route="{{route}}"
          pattern="/:page"
          data="{{pageData}}"
          tail="{{subroute}}">
      </app-route>
    `;
    }
}

customElements.define('rs-route', ReplusRoute);
