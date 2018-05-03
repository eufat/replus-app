import {PolymerElement, html} from '@polymer/polymer/polymer-element';

import '@polymer/font-roboto/roboto';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-selector/iron-selector';

import '@polymer/app-route/app-location';
import '@polymer/app-route/app-route';

import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/neon-animation/neon-animations';

import './main-dashboard';
import './main-auth';

class MainApp extends PolymerElement {
    static get properties() {
        return {};
    }

    ready() {
        super.ready();
        const thisMainApp = this;
    }

    isEqualTo(a, b) {
        return a === b;
    }

    mapDeviceRoute(route) {
        const array = ['remote', 'vision'];
        return array.indexOf(route);
    }

    static get template() {
        return html`
            <app-location route="{{route}}"></app-location>
            <app-route
                route="{{route}}"
                pattern="/:page"
                data="{{containerRoute}}"
                tail="{{routeTail}}">
            </app-route>
            <main class="content">
                <iron-pages role="main" selected="{{containerRoute.page}}" attr-for-selected="name" fallback-selection="auth">
                    <main-dashboard name="dashboard" route="{{routeTail}}"></main-dashboard>
                    <main-auth name="auth" route="{{routeTail}}"></main-auth>
                </iron-pages>
            </main>
            <div id="firebaseuicontainer"></div>

    `;
    }
}

customElements.define('main-app', MainApp);
