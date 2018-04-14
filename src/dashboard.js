import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import "@polymer/app-layout";

class Dashboard extends PolymerElement {
  static get template() {
    return html`
      <p>Dashboard</p>
    `;
  }
}

customElements.define("dashboard", Dashboard);
