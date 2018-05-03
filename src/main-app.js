import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import PolymerRedux from 'polymer-redux/polymer-redux';

import '@polymer/font-roboto/roboto';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-selector/iron-selector';

import '@polymer/app-route/app-location';
import '@polymer/app-route/app-route';

import '@polymer/paper-styles/color';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/shadow';
import '@polymer/paper-styles/default-theme';

import {firebaseConfig} from './configs';
import store from './main-store';
import actions from './main-actions';

import './main-dashboard';
import './main-auth';

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
                <iron-pages role="main" selected="{{containerRoute.page}}" attr-for-selected="name"  selected-attribute="visible">
                    <main-dashboard name="dashboard" route="{{routeTail}}"></main-dashboard>
                    <main-auth name="auth" route="{{routeTail}}"></main-auth>
                </iron-pages>
            </main>
    `;
    }
}

customElements.define('main-app', MainApp);
