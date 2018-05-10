import {LitElement, html} from '@polymer/lit-element';

import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/iron-pages/iron-pages.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';

import './snack-bar.js';

import {connect} from 'pwa-helpers/connect-mixin.js';
import {installRouter} from 'pwa-helpers/router.js';
import {installOfflineWatcher} from 'pwa-helpers/network.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';
import {updateMetadata} from 'pwa-helpers/metadata.js';

import {store} from '../store.js';
import {
    navigate,
    updateOffline,
    updateDrawerState,
    updateLayout,
    setCurrentUser,
    authenticateUser,
    deauthenticateUser,
} from '../actions/app.js';

import './main-auth.js';
import './main-dashboard.js';
import './main-not-found.js';

import {firebaseConfig} from '../configs.js';

class MainApp extends connect(store)(LitElement) {
    _render() {
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

    _firstRendered() {
        firebase.initializeApp(firebaseConfig);

        firebase.auth().onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                store.dispatch(authenticateUser());
                store.dispatch(setCurrentUser(firebaseUser));
            } else {
                store.dispatch(deauthenticateUser());
            }
        });
    }

    _stateChanged(state) {}
}

window.customElements.define('main-app', MainApp);
