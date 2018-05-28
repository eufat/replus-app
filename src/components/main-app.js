import {PolymerElement, html} from '@polymer/polymer/polymer-element';

import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';

import './snack-bar.js';

import {connect} from 'pwa-helpers/connect-mixin.js';

import {store} from '../store.js';
import {
    setCurrentUser,
    authenticateUser,
    deauthenticateUser,
} from '../actions/app.js';

import './main-auth.js';
import './main-dashboard.js';
import './not-found.js';

class MainApp extends connect(store)(PolymerElement) {
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
                    <not-found name="not-found"></not-found>
                </iron-pages>
            </main>
    `;
    }

    ready() {
        super.ready();

        firebase.auth().onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                store.dispatch(authenticateUser());
                store.dispatch(setCurrentUser(firebaseUser));
            } else {
                store.dispatch(deauthenticateUser());
            }
        });
    }

    _stateChanged(state) {
        console.log(state);
    }
}

window.customElements.define('main-app', MainApp);
