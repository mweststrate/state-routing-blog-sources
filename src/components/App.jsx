import React from 'react';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import { observable } from 'mobx';

export const App = observer(({ store }) => (
    <div>
        { renderCurrentView(store) }
        Current user:
        { store.isAuthenticated ? store.currentUser.name : "unknown user" }
        <DevTools />
    </div>
))

function renderCurrentView(store) {
    const view = store.currentView;
    switch (view.name) {
        case "overview":
            return <DocumentOverview view={view} store={store} />
        case "document":
            return <Document view={view} store={store} />
    }
}


const DocumentOverview = observer(({ view, store }) => {
    switch (view.documents.state) {
        case "pending":
            return <h1>Loading documents..</h1>
        case "rejected":
            return <Error error={view.documents.reason} />
        case "fulfilled":
            return (
                <div>
                    <h1>Document overview</h1>
                    <ul>
                        { view.documents.value.map(
                            doc => <li key={doc.id} onClick={() => store.showDocument(doc.id)}>{doc.name}</li>
                        ) }
                    </ul>
                </div>
            )
    }
})

const Document = observer(({ view, store }) => {
    if (!store.isAuthenticated)
        return <Login store={store} afterLogin={() => store.showDocument(view.documentId)} />
    switch (view.document.state) {
        case "pending":
            return <h1>Loading document.. { view.documentId }</h1>
        case "rejected":
            return <Error error={view.document.reason} />
        case "fulfilled":
            return (
                <div>
                    <h1>{ view.document.value.name }</h1>
                    <p> { view.document.value.text }</p>
                    <button onClick={() => store.showOverview()}>Back to documents</button>
                </div>
            )
    }
})

const Error = ({ error }) => <h1>{"Error: " + error}</h1>

@observer
class Login extends React.Component {
    @observable username = "";
    @observable password = "";
    @observable message = "Login with 'user' and '1234'"

    render() {
        return (
            <div>
                <h1>Please login</h1>
                <h2>{this.message}</h2>
                <br/>Username
                <br/><input value={this.username} onChange={e => this.username = e.target.value} />
                <br/>Password
                <br/><input value={this.password} onChange={e => this.password = e.target.value} />
                <br/><button onClick={this.onLogin}>Login</button>
            </div>
        )
    }

    onLogin = () => {
        this.message = "Verifying credentials..."
        this.props.store.performLogin(
            this.username,
            this.password,
            (authenticated) => {
                if (authenticated) {
                    this.message = "Login accepted"
                    this.props.afterLogin()
                } else {
                    this.message = "Login failed"
                }
            }
        )
    }
}