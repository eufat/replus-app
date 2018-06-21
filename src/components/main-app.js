import {LitElement, html} from '@polymer/lit-element';

import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';

import {connect} from 'pwa-helpers/connect-mixin.js';
import {installRouter} from 'pwa-helpers/router.js';
import {installOfflineWatcher} from 'pwa-helpers/network.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';
import {updateMetadata} from 'pwa-helpers/metadata.js';

import {env} from '../configs';
import firebase from '../firebase.js';
import {store} from '../store.js';
import {setCurrentUser, authenticateUser, deauthenticateUser} from '../actions/app.js';
import {navigate, updateOffline, updateLayout} from '../actions/app.js';
import {toTitleCase} from '../utils';
import './snack-bar.js';

import './main-help.js';
import './not-found.js';
import './main-account.js';

import './activity-main.js';
import './rooms-main.js';
import './settings-main.js';

import './remote-ac.js';
import './remote-tv.js';

const includes = _.includes;

class MainApp extends connect(store)(LitElement) {
    _render({appTitle, _page, _drawerOpened, _snackbarOpened, _snackbarText, _offline}) {
        const onIndex = (parent) => {
            if (_page) {
                // Check if it is only parent. ex: 'dashboard' is only parent.
                const onlyParent = includes(_page, parent) && !includes(_page, '/');

                let paths = _page.split('/');
                paths = paths.filter((item) => item !== '');

                // Check either multilevel or not. ex: 'dashboard/test' is multilevel.
                const notMultilevel = !(paths.length > 1);

                // If only the parent and slash. ex: 'dashboard/' is only parent with slash.
                const onlyParentAndSlash = includes(_page, parent) && notMultilevel;
                return onlyParent || onlyParentAndSlash;
            }
        };

        return html`
            <style>
                .page {
                    display: none;
                }

                .page[active] {
                    display: block;
                }
            </style>
            <main class="main-content">
                <main-auth class="page" active?="${includes(_page, 'auth')}"></main-auth>
                <main-dashboard class="page" active?="${includes(_page, 'dashboard')}">
                    <activity-main class="page" active?="${includes(_page, 'activity') || onIndex('dashboard')}"></activity-main>
                    <rooms-main class="page" active?="${includes(_page, 'rooms')}"></rooms-main>
                    <settings-main class="page" active?="${includes(_page, 'settings')}"></settings-main>
                    <main-account class="page" active?="${includes(_page, 'account')}"></main-account>
                    <main-help class="page" active?="${includes(_page, 'help')}"></main-help>
                    <remote-ac class="page" active?="${includes(_page, 'remote-ac')}"></remote-ac>
                    <remote-tv class="page" active?="${includes(_page, 'remote-tv')}"></remote-tv>
                </main-dashboard>
            </main>
            <snack-bar active?="${_snackbarOpened}" text="${_snackbarText}"></snack-bar>
    `;
    }

    static get properties() {
        return {
            appTitle: String,
            _page: String,
            _drawerOpened: Boolean,
            _snackbarOpened: Boolean,
            _snackbarText: String,
            _offline: Boolean,
        };
    }

    constructor() {
        super();
        setPassiveTouchGestures(true);
    }

    _firstRendered() {
        installRouter((location) => store.dispatch(navigate(window.decodeURIComponent(location.pathname))));
        installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
        installMediaQueryWatcher(`(min-width: 460px)`, (matches) => store.dispatch(updateLayout(matches)));

        firebase.auth().onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                store.dispatch(authenticateUser());
                store.dispatch(setCurrentUser(firebaseUser));
            } else {
                store.dispatch(deauthenticateUser());
            }
        });
    }

    _didRender(properties, changeList) {
        if ('_page' in changeList) {
            const pageTitle = properties.appTitle + ' - ' + toTitleCase(changeList._page.split('/').join(' '));
            updateMetadata({
                title: pageTitle,
                description: pageTitle,
                // This object also takes an image property, that points to an img src.
            });
        }
    }

    _stateChanged(state) {
        console.log(state);
        this._page = state.app.page;
        this._offline = state.app.offline;
        this._snackbarOpened = state.app.snackbarOpened;
        this._snackbarText = state.app.snackbarText;
        this._drawerOpened = state.app.drawerOpened;
    }
}

window.customElements.define('main-app', MainApp);
