import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/font-roboto/roboto';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-selector/iron-selector';

import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/neon-animation/neon-animations';

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

            paper-dropdown-menu.device-dropdown {
                margin: 1em;
                --paper-input-container-underline: {
                   display: none;
                };
            }
          </style>
          <rs-route></rs-route>
          <!-- <rs-auth /> -->
          <rs-layout>
            <span slot='app-content'>
            </span>
            <span slot='drawer-content'>
                <paper-dropdown-menu class="device-dropdown" label="Choose device" no-label-float noink no-animations>
                <paper-listbox slot="dropdown-content">
                    <paper-item>Replus Remote</paper-item>
                    <paper-item>Replus Vision</paper-item>
                </paper-listbox>
                </paper-dropdown-menu>
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
