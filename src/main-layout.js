import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/polymer-legacy';
import '@polymer/iron-icons/iron-icons';

import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout';
import '@polymer/app-layout/app-header-layout/app-header-layout';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects';
import '@polymer/app-layout/demo/sample-content';

import '@polymer/paper-item/paper-item';
import '@polymer/paper-material/paper-material';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-progress/paper-progress';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-icon-button/paper-icon-button';

import {hideOnClickOutside} from './utils';

class MainLayout extends PolymerElement {
    static get properties() {
        return {};
    }

    toggleAccountMenu(event) {
        const accountMenuDisplay = this.$.accountMenu.style.display === 'block';

        if (accountMenuDisplay) {
            this.$.accountMenu.style.display = 'none';
            this.accountMenu = false;
        } else {
            this.$.accountMenu.style.display = 'block';
            this.accountMenu = true;
        }
    }

    static get template() {
        return html`
          <style>
            app-header {
              background-color: #4285f4;
              color: #fff;
            }

            app-header paper-icon-button {
              --paper-icon-button-ink-color: white;
            }

            app-drawer-layout:not([narrow]) [drawer-toggle] {
              display: none;
            }

            a {
              text-decoration: none;
              color: inherit;
              font-size: inherit;
            }

            #accountMenu {
              margin: 0;
              right: 0;
              top: auto;
              position: fixed;
              display: none;
              min-width: 200px;
            }
          </style>
          <app-drawer-layout fullbleed>

            <app-header-layout fullbleed>

              <app-header fixed effects="waterfall" slot="header">
                <app-toolbar>
                  <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
                  <div main-title>Replus App</div>
                  <paper-icon-button icon="more-vert" on-click="toggleAccountMenu"></paper-icon-button>
                </app-toolbar>
              </app-header>

              <slot name="app-content"></slot>
              <paper-material id="accountMenu">
                <paper-listbox>
                  <a name='account' href='/account' tabindex='-1'>
                    <paper-item raised>Account</paper-item>
                  </a>
                  <a name='sign-out' href='/' tabindex='-1'>
                    <paper-item raised>Sign Out</paper-item>
                  </a>
                </paper-listbox>
              </paper-material>
            </app-header-layout>

            <app-drawer id="drawer" slot="drawer">
              <slot name="drawer-content"></slot>
            </app-drawer>

          </app-drawer-layout>
    `;
    }
}

customElements.define('main-layout', MainLayout);
