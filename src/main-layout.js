import { PolymerElement, html } from "@polymer/polymer/polymer-element";
import "@polymer/polymer/polymer-legacy";
import "@polymer/font-roboto/roboto";
import "@polymer/iron-icons/iron-icons";
import "@polymer/paper-progress/paper-progress";
import "@polymer/paper-checkbox/paper-checkbox";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/app-layout/app-drawer/app-drawer";
import "@polymer/app-layout/app-drawer-layout/app-drawer-layout";
import "@polymer/app-layout/app-header-layout/app-header-layout";
import "@polymer/app-layout/app-scroll-effects/app-scroll-effects";
import "@polymer/app-layout/demo/sample-content";

class MainLayout extends PolymerElement {
  static get properties() {
    return {};
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
      </style>
      <app-drawer-layout fullbleed>

        <app-header-layout fullbleed>

          <app-header fixed effects="waterfall" slot="header">
            <app-toolbar>
              <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
              <div main-title>Replus App</div>
            </app-toolbar>
          </app-header>

          <slot name="app-content"></slot>

        </app-header-layout>

        <app-drawer slot="drawer">
          <slot name="drawer-content"></slot>
        </app-drawer>

      </app-drawer-layout>
    `;
  }
}

customElements.define("main-layout", MainLayout);
