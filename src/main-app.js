import { PolymerElement, html } from "@polymer/polymer/polymer-element";
import "@polymer/app-layout/demo/sample-content";
import "./main-dashboard";

class MainApp extends PolymerElement {
  static get properties() {
    return {};
  }

  static get template() {
    return html`
      <style>
      </style>
      <main-dashboard>
        <span slot="app-content">
          App content
        </span>
        <span slot="drawer-content">
          Drawer content
        </span>
      </main-dashboard>
    `;
  }
}

customElements.define("main-app", MainApp);
