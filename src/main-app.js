import { PolymerElement, html } from "@polymer/polymer/polymer-element";
import "@polymer/iron-flex-layout/iron-flex-layout";
import "@polymer/iron-pages/iron-pages";
import "@polymer/iron-selector/iron-selector";
import "@polymer/paper-item/paper-item";

import "./main-layout";
import "./main-auth";
import "./main-route";

class MainApp extends PolymerElement {
  static get properties() {
    return {
      menus: {
        type: Array,
        value() {
          return [
            {
              name: "events",
              title: "Events"
            },
            {
              name: "streams",
              title: "Streams"
            },
            {
              name: "settings",
              title: "Settings"
            }
          ];
        }
      }
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
      <main-route></main-route>
      <!-- <main-auth /> -->
      <main-layout>
        <span slot="app-content">
        </span>
        <span slot="drawer-content">
          <app-toolbar>Replus Vision</app-toolbar>
          <iron-selector
              class="nav-menu"
              selected=""
              attr-for-selected="name"
              on-iron-activate="">
              <template is="dom-repeat" items="{{menus}}">
                <a name="[[item.name]]" href="#/[[item.name]]" tabindex="-1">
                  <paper-item raised>[[item.title]]</paper-item>
                </a>
              </template>
          </iron-selector>
        </span>
      </main-layout>
    `;
  }
}

customElements.define("main-app", MainApp);
