import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import "@polymer/paper-checkbox/paper-checkbox.js";
import "@polymer/app-layout/app-header/app-header.js";
import "@polymer/app-layout/app-toolbar/app-toolbar.js";
import "@polymer/app-layout/app-drawer/app-drawer.js";

class MainApp extends PolymerElement {
  static get properties() {
    return {};
  }

  static get template() {
    return html`
      <style is="custom-style">
        app-toolbar {
          background-color: #4285f4;
          color: #fff;
        }
      </style>
      <app-header reveals>
        <app-toolbar>
          <div main-title>Replus App</div>
        </app-toolbar>
      </app-header>
    `;
  }
}

customElements.define("main-app", MainApp);
