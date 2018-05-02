import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/app-route/app-location';
import '@polymer/app-route/app-route';

import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-selector/iron-selector';

export default class DataReducer extends PolymerElement {
    static get properties() {
        return {
            store: {
                notify: true,
                readonly: true,
                type: Object,
            },
        };
    }

    reduce(state, action) {
        const type = action.type;
        const data = action.data;

        for (let i = 0; i < this.children.length; i++) {
            state = this.children[i].reduce(state, action);
        }

        switch (type) {
            case 'init':
                console.log(JSON.stringify(data));
                return Object.assign({}, state, data);
            default:
                return state;
        }
    }

    static get template() {
        return html`
            <template></template>
    `;
    }
}

customElements.define('data-reducer', DataReducer);
