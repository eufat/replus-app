import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/app-route/app-location';
import '@polymer/app-route/app-route';

import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-selector/iron-selector';

export default class DataStore extends PolymerElement {
    static get properties() {
        return {
            state: {
                notify: true,
                type: Object,
            },
            reducer: {
                notify: true,
                readonly: true,
                type: Object,
                observer: 'setReducer',
            },
        };
    }

    setReducer() {
        if (!this.appStore) {
            this.appStore = Redux.createStore(
                this.reducer.reduce.bind(this.reducer)
            );
            this.appStore.subscribe(() => {
                this.state = this.appStore.getState();
            });
        }
    }

    dispatch(action, data) {
        this.appStore.dispatch({type: action, data});
    }

    static get template() {
        return html`
            <template></template>
    `;
    }
}

customElements.define('data-route', DataStore);
