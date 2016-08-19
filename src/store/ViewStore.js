import { observable, computed, action } from 'mobx';
import { fromPromise } from 'mobx-utils';

class ViewStore {
    fetch = null;

    @observable currentUser = null;
    @observable currentView = null;

    constructor(fetch) {
        this.fetch = fetch
    }

    @computed get isAuthenticated() {
        return this.currentUser !== null
    }

    @computed get currentPath() {
        switch(this.currentView.name) {
            case "overview": return "/document/"
            case "document": return `/document/${this.currentView.documentId}`
        }
    }

    @action showOverview() {
        this.currentView = {
            name: "overview",
            documents: fromPromise(this.fetch(`/json/documents.json`))
        }
    }

    @action showDocument(documentId) {
        this.currentView = {
            name: "document",
            documentId,
            document: fromPromise(
                this.isAuthenticated
                    ? this.fetch(`/json/${documentId}.json`)
                    : Promise.reject("Authentication required")
            )
        }
    }

    @action performLogin(username, password, callback) {
        this.fetch(`/json/${username}-${password}.json`)
            .then(user => {
                this.currentUser = user
                callback(true)
            })
            .catch(err => {
                callback(false)
            })
    }
}

export default ViewStore;
