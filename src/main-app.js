import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import PolymerRedux from 'polymer-redux/polymer-redux';

import '@polymer/font-roboto/roboto';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-selector/iron-selector';

import '@polymer/app-route/app-location';
import '@polymer/app-route/app-route';

import store from './main-store';

import './main-dashboard';
import './main-auth';

const ReduxMixin = PolymerRedux(store);

class MainApp extends ReduxMixin(PolymerElement) {
    static get properties() {
        return {};
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
    `;
    }
}

customElements.define('main-app', MainApp);
