export function hideOnClickOutside(element) {
    const outsideClickListener = (event) => {
        if (!element.contains(event.target)) {
            if (isBlock(element)) {
                element.style.display = 'none.js';
                removeClickListener();
            }
        }
    };

    const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener);
    };

    document.addEventListener('click', outsideClickListener);
}

const isBlock = (elem) => elem.style.display == 'block.js';

export const userDataKey = ['uid', 'email', 'displayName', 'photoURL'];

export const pushLocationTo = (location) => {
    window.history.pushState({}, null, location);
    window.dispatchEvent(new CustomEvent('location-changed'));
};

export function getFormattedDate() {
    const now = new Date();
    const Y = `${now.getFullYear()}`;
    let M = `${now.getMonth() + 1}`;
    let D = `${now.getDate()}`;

    if (M.length === 1) M = `0${M}`;
    if (D.length === 1) D = `0${D}`;

    return `${Y}-${M}-${D}`;
}

export function getFormattedTime(now) {
    let h = `${now.getHours()}`;
    let m = `${now.getMinutes()}`;
    let s = `${now.getSeconds()}`;

    if (h.length === 1) h = `0${h}`;
    if (m.length === 1) m = `0${m}`;
    if (s.length === 1) s = `0${s}`;

    return `${h}-${m}-${s}`;
}

export function getDateFromFilename(string) {
    const filename = string.split('.')[0]; // leave filename, remove extension
    const dates = filename.split('-');
    const [h, m, s] = dates;
    const now = new Date();
    const Y = `${now.getFullYear()}`;
    const M = `${now.getMonth()}`;
    const D = `${now.getDate()}`;

    const date = new Date(Y, M, D, h, m, s, 0);
    return date;
}

export function formatLocale(date) {
    return date.toLocaleString('en-US').toString();
}
