import test from "tape"
import { when } from "mobx"
import ViewStore from "./ViewStore"
import { readFileSync } from "fs"

function stubFetch(path) {
    return new Promise((resolve, reject) => {
        resolve(JSON.parse(readFileSync(__dirname + "/../../dist" + path)))
    })
}

test("it should be possible to open the documents overview", t => {
    const viewStore = new ViewStore(stubFetch)
    viewStore.showOverview()

    t.equal(viewStore.currentView.name, "overview")
    when(
        () => viewStore.currentView.documents.state !== "pending",
        () => {
            t.equal(viewStore.currentView.documents.state, "fulfilled")
            t.equal(viewStore.currentView.documents.value.length, 2)
            t.end()
        }
    )
})

test("it should not be possible to read documents without login", t => {
    const viewStore = new ViewStore(stubFetch)
    viewStore.showDocument(1)

    t.equal(viewStore.currentView.name, "document")
    t.equal(viewStore.isAuthenticated, false)
    when(
        () => viewStore.currentView.document.state !== "pending",
        () => {
            t.equal(viewStore.currentView.document.state, "rejected")
            t.notOk(viewStore.currentView.document.value)
            t.end()
        }
    )
})

test("it should be possible to read documents with login", t => {
    const viewStore = new ViewStore(stubFetch)

    viewStore.performLogin("user", "1234", result => {
        t.equal(result, true)
        t.equal(viewStore.isAuthenticated, true)
        t.equal(viewStore.currentUser.name, "Test user")

        viewStore.showDocument(1)

        t.equal(viewStore.currentView.name, "document")
        when(
            () => viewStore.currentView.document.state !== "pending",
            () => {
                t.equal(viewStore.currentView.document.state, "fulfilled")
                t.equal(viewStore.currentView.document.value.text, "fun")
                t.end()
            }
        )
    })
})
