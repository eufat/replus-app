import {
    PolymerElement,
    html,
} from '/node_modules/@polymer/polymer/polymer-element.js';
import PolymerRedux from '/node_modules/polymer-redux/polymer-redux.js';

import '/node_modules/@polymer/font-roboto/roboto.js';
import '/node_modules/@polymer/iron-flex-layout/iron-flex-layout.js';
import '/node_modules/@polymer/iron-pages/iron-pages.js';
import '/node_modules/@polymer/iron-selector/iron-selector.js';

import '/node_modules/@polymer/app-route/app-location.js';
import '/node_modules/@polymer/app-route/app-route.js';

import '/node_modules/@polymer/paper-styles/color.js';
import '/node_modules/@polymer/paper-styles/typography.js';
import '/node_modules/@polymer/paper-styles/shadow.js';
import '/node_modules/@polymer/paper-styles/default-theme.js';

import {firebaseConfig} from './configs.js';
import store from './main-store.js';
import actions from './main-actions.js';

import './main-dashboard.js';
import './main-auth.js';
import './main-not-found.js';

const ReduxMixin = PolymerRedux(store);

class MainApp extends ReduxMixin(PolymerElement) {
    static get actions() {
        return actions;
    }

    ready() {
        super.ready();

        const thisMainApp = this;

        firebase.auth().onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                thisMainApp.dispatch('authenticateUser');
                thisMainApp.dispatch('setCurrentUser', firebaseUser);
            } else {
                thisMainApp.dispatch('deauthenticateUser');
            }
        });
    }

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
                <iron-pages role="main" selected="{{containerRoute.page}}" attr-for-selected="name"  selected-attribute="visible" fallback-selection="not-found">
                    <main-dashboard name="dashboard" route="{{routeTail}}"></main-dashboard>
                    <main-auth name="auth" route="{{routeTail}}"></main-auth>
                    <main-not-found name="not-found"></main-not-found>
                </iron-pages>
            </main>
    `;
    }
}

customElements.define('main-app', MainApp);
