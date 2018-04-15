import { PolymerElement, html } from "@polymer/polymer/polymer-element";
import "@polymer/app-layout/demo/sample-content";
import "./main-dashboard";
import "./main-auth";

class MainApp extends PolymerElement {
  static get properties() {
    return {};
  }

  static get template() {
    return html`
      <style>
      </style>
      <main-auth />
      <!--
      <main-dashboard>
        <span slot="app-content">
        </span>
        <span slot="drawer-content">
          Drawer content
        </span>
      </main-dashboard>
      -->
    `;
  }
}

customElements.define("main-app", MainApp);
