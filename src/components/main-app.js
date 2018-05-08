import { LitElement, html } from "@polymer/lit-element";

import "@polymer/app-layout/app-drawer/app-drawer.js";
import "@polymer/app-layout/app-header/app-header.js";
import "@polymer/app-layout/app-scroll-effects/effects/waterfall.js";
import "@polymer/app-layout/app-toolbar/app-toolbar.js";
import { setPassiveTouchGestures } from "@polymer/polymer/lib/utils/settings.js";

import "./snack-bar.js";

import { connect } from "pwa-helpers/connect-mixin.js";
import { installRouter } from "pwa-helpers/router.js";
import { installOfflineWatcher } from "pwa-helpers/network.js";
import { installMediaQueryWatcher } from "pwa-helpers/media-query.js";
import { updateMetadata } from "pwa-helpers/metadata.js";

import { store } from "../store.js";
import {
    navigate,
    updateOffline,
    updateDrawerState,
    updateLayout
} from "../actions/app.js";

class MainApp extends connect(store)(LitElement) {
    _render({ appTitle, _page, _drawerOpened, _snackbarOpened, _offline }) {
        // Anything that's related to rendering should be done in here.
        return html`
    <style>
      :host {}

      .menu-btn {
        background: none;
        border: none;
        fill: var(--app-header-text-color);
        cursor: pointer;
        height: 44px;
        width: 44px;
      }

      .drawer-list {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 24px;
        background: var(--app-drawer-background-color);
        position: relative;
      }

      .drawer-list > a {
        display: block;
        text-decoration: none;
        color: var(--app-drawer-text-color);
        line-height: 40px;
        padding: 0 24px;
      }

      .drawer-list > a[selected] {
        color: var(--app-drawer-selected-color);
      }

      .main-content {
        padding-top: 64px;
        min-height: 100vh;
      }

      .page {
        display: none;
      }

      .page[active] {
        display: block;
      }
    </style>

    <!-- Header -->
    <app-header condenses reveals effects="waterfall">
      <app-toolbar class="toolbar-top">
        <button class="menu-btn" title="Menu" on-click="${_ =>
            store.dispatch(updateDrawerState(true))}">Menu</button>
        <div main-title>${appTitle}</div>
      </app-toolbar>

      <!-- This gets hidden on a small screen-->
      <nav class="toolbar-list">
        <a selected?="${_page === "view1"}" href="/view1">View One</a>
        <a selected?="${_page === "view2"}" href="/view2">View Two</a>
        <a selected?="${_page === "view3"}" href="/view3">View Three</a>
      </nav>
    </app-header>

    <!-- Drawer content -->
    <app-drawer opened="${_drawerOpened}"
        on-opened-changed="${e =>
            store.dispatch(updateDrawerState(e.target.opened))}">
      <nav class="drawer-list">
        <a selected?="${_page === "view1"}" href="/view1">View One</a>
        <a selected?="${_page === "view2"}" href="/view2">View Two</a>
        <a selected?="${_page === "view3"}" href="/view3">View Three</a>
      </nav>
    </app-drawer>

    <!-- Main content -->
    <main class="main-content">
      <my-view1 class="page" active?="${_page === "view1"}"></my-view1>
      <my-view2 class="page" active?="${_page === "view2"}"></my-view2>
      <my-view3 class="page" active?="${_page === "view3"}"></my-view3>
      <my-view404 class="page" active?="${_page === "view404"}"></my-view404>
    </main>

    <footer>
      <p>Made with &lt;3 by the Polymer team.</p>
    </footer>

    <snack-bar active?="${_snackbarOpened}">
        You are now ${_offline ? "offline" : "online"}.</snack-bar>
    `;
    }

    static get properties() {
        return {
            appTitle: String,
            _page: String,
            _drawerOpened: Boolean,
            _snackbarOpened: Boolean,
            _offline: Boolean
        };
    }

    constructor() {
        super();
        // To force all event listeners for gestures to be passive.
        // See https://www.polymer-project.org/2.0/docs/devguide/gesture-events#use-passive-gesture-listeners
        setPassiveTouchGestures(true);
    }

    _firstRendered() {
        installRouter(location =>
            store.dispatch(
                navigate(window.decodeURIComponent(location.pathname))
            )
        );
        installOfflineWatcher(offline =>
            store.dispatch(updateOffline(offline))
        );
        installMediaQueryWatcher(`(min-width: 460px)`, matches =>
            store.dispatch(updateLayout(matches))
        );
    }

    _didRender(properties, changeList) {
        if ("_page" in changeList) {
            const pageTitle = properties.appTitle + " - " + changeList._page;
            updateMetadata({
                title: pageTitle,
                description: pageTitle
                // This object also takes an image property, that points to an img src.
            });
        }
    }

    _stateChanged(state) {
        this._page = state.app.page;
        this._offline = state.app.offline;
        this._snackbarOpened = state.app.snackbarOpened;
        this._drawerOpened = state.app.drawerOpened;
    }
}

window.customElements.define("main-app", MainApp);
