import { createHistory } from 'history';
import { Router } from 'director';
import { autorun } from 'mobx';

export function startRouter(store) {

    // update state on url change
    const router = new Router({
        "/document/:documentId": (id) => store.showDocument(id),
        "/document/": () => store.showOverview()
    }).configure({
        notfound: () => store.showOverview(),
        html5history: true
    }).init()

    // update url on state changes
    autorun(() => {
        const path = store.currentPath
        if (path !== window.location.pathname)
                window.history.pushState(null, null, path)
    })

}
