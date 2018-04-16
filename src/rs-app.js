import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/font-roboto/roboto';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-selector/iron-selector';
import '@polymer/paper-item/paper-item';

import './rs-layout';
import './rs-auth';
import './rs-route';

class ReplusApp extends PolymerElement {
    static get properties() {
        return {
            menus: {
                type: Array,
                value() {
                    return [
                        {
                            name: 'events',
                            title: 'Events',
                        },
                        {
                            name: 'streams',
                            title: 'Streams',
                        },
                        {
                            name: 'settings',
                            title: 'Settings',
                        },
                    ];
                },
            },
        };
    }

    static get template() {
        return html`
          <style>
            a {
              text-decoration: none;
              color: inherit;
              font-size: inherit;
            }
          </style>
          <rs-route></rs-route>
          <!-- <rs-auth /> -->
          <rs-layout>
            <span slot='app-content'>
            </span>
            <span slot='drawer-content'>
              <app-toolbar>Replus Vision</app-toolbar>
              <iron-selector
                  class='nav-menu'
                  selected=''
                  attr-for-selected='name'
                  on-iron-activate=''>
                  <template is='dom-repeat' items='{{menus}}'>
                    <a name='[[item.name]]' href='/[[item.name]]' tabindex='-1'>
                      <paper-item raised>[[item.title]]</paper-item>
                    </a>
                  </template>
              </iron-selector>
            </span>
          </rs-layout>
    `;
    }
}

customElements.define('rs-app', ReplusApp);
