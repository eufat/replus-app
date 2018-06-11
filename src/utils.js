export const userDataKey = ['uid', 'email', 'displayName', 'photoUrl'];

export const resolutionsList = ['320p', '480p', '720p', '1080p'];

export const rotationsList = ['0°', '90°', '180°', '270°'];

export const brandsList = ['samsung', 'lg', 'panasonic', 'toshiba', 'mitsubishi', 'daikin', 'dast'];

export const upperCases = ['lg', 'tv', 'ac'];

export function hideOnClickOutside(element) {
    const outsideClickListener = (event) => {
        if (!element.contains(event.target)) {
            if (isBlock(element)) {
                element.style.display = 'none';
                removeClickListener();
            }
        }
    };

    const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener);
    };

    document.addEventListener('click', outsideClickListener);
}

const isBlock = (elem) => elem.style.display == 'block';

export const pushLocationTo = (location) => {
    window.history.pushState({}, null, location);
    window.dispatchEvent(new CustomEvent('location-changed'));

    window.location.href = location;
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

export function getDateFromFilename(name) {
    if (name !== undefined) {
        const filename = name.split('.')[0]; // leave filename, remove extension
        const dates = filename.split('-');
        const [h, m, s] = dates;
        const now = new Date();
        const Y = `${now.getFullYear()}`;
        const M = `${now.getMonth()}`;
        const D = `${now.getDate()}`;
        const date = new Date(Y, M, D, h, m, s, 0);
        return date;
    }
}

export function formatLocale(date) {
    return date.toLocaleString('en-US').toString();
}

export function expandResolution(resolution) {
    const num = parseInt(resolution.split('p')[0]);
    let output = {
        width: 0,
        height: 0,
    };

    switch (num) {
        case 320:
            output.width = 480;
            output.height = 320;
            break;
        case 480:
            output.width = 480;
            output.height = 640;
            break;
        case 720:
            output.width = 720;
            output.height = 1280;
            break;
        case 1080:
            output.width = 1920;
            output.height = 1080;
            break;
    }

    return output;
}

export function getNewRoomTemplate() {
    return {
        devices: [],
        name: 'My Room',
        owner: '',
        id: '',
        remotes: [],
        onEdit: true,
    };
}

export function qs(obj) {
    const params = new URLSearchParams();

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            params.append(key, obj[key]);
        }
    }

    return params;
}

export function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        const shouldUpperCase = upperCases.indexOf(txt) > -1;

        if (shouldUpperCase) {
            return txt.toUpperCase();
        } else {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    });
}

export function stringContain(str, target) {
    return str.indexOf(target) !== -1;
}

export function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

export function getCookie(cname) {
    const name = cname + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}
