(function() {
    this.vimInsertMode = false
    this.pendingSuccessfulCodeLoadAfterError = false
    this.liveCodeState = null
    this.liveCodeVersion = 1
    this.liveViewElement = null
    this.mode = "editing" // NOTE: Duplicated in Elm
    this.modeChangedSincePageLoad = false
    this.firstAttemptToLoadCodeHasRun = false

    init = () => {
        setUpLiveView()
        setUpConsole()

        let editor = setUpEditor()
        let ui = setUpEditorControlUI(editor)

        setUpCodeLoading(ui)
        setUpModeHandling(editor, ui)
    }

    this.setUpEditorControlUI = () => {
        let node = document.getElementsByClassName("js-editor-controls")[0]
        let settings = localStorage.getItem("settings")

        if(settings) { settings = JSON.parse(settings) }

        // Throw away old incompatible data, remove after juli 2017
        if(settings && settings.githubProjectPath) { settings = null }

        let ui = Elm.Main.embed(node, settings)

        ui.ports.saveSettings.subscribe((settings) => {
            localStorage.setItem("settings", JSON.stringify(settings))
        })

        ui.ports.rebootPlayer.subscribe(() => {
            liveViewElement.contentWindow.location.reload()
        })

        return ui
    }

    this.setUpCodeLoading = (ui) => {
        ui.ports.loadCodeFromGithub.subscribe((url) => {
            fetchFromUrl(url, function(body) {
                // https://stackoverflow.com/questions/22587308/convert-iso-8859-1-to-utf-8
                code = decodeURIComponent(escape(atob(JSON.parse(body).content)))

                replaceCodeInEditor(editor, code)

                // Reload page after replacing code as this is often required to get it running
                window.location.reload()
            })
        })

        ui.ports.loadCodeFromGist.subscribe((url) => {
            fetchFromUrl(url, function(body) {
                files = Object.values(JSON.parse(body).files)

                if(files.length != 1) {
                    alert("Importing more than one file in a gist isn't supported yet.")
                }
                else {
                    replaceCodeInEditor(editor, files[0].content)

                    // Reload page after replacing code as this is often required to get it running
                    window.location.reload()
                }
            })
        })
    }

    this.setUpModeHandling = (editor, ui) => {
        that = this
        ui.ports.modeChangedTo.subscribe((mode) => {
            that.mode = mode;

            if(mode == "editing") {
                liveViewElement.blur()
                editor.focus()
            } else {
                editor.blur()
                liveViewElement.focus()
            }

            if(modeChangedSincePageLoad) { runCode(editor) }
            modeChangedSincePageLoad = true
        })

        editor.on("focus", function() { ui.ports.updateMode.send("editing") })

        keyWasPressed = (e) => {
            if(e.key == decodeURIComponent(escape("§")) && e.type == "keydown") {
                e.preventDefault()

                if(that.mode == "editing") {
                    ui.ports.updateMode.send("playing")
                } else {
                    ui.ports.updateMode.send("editing")
                }
            }
        }

        document.addEventListener("keydown", keyWasPressed)
        document.addEventListener("keyup", keyWasPressed)

        window.addEventListener("message", function(event) {
            if(event.data == "iframeLoaded") { if(firstAttemptToLoadCodeHasRun) { runCode(editor) } else { loadSavedCode(editor) } }
            else if(event.data == "iframeWasClickedOrTouched") { ui.ports.updateMode.send("playing") }
            else if(event.data.keyDownInIframe) {
                keyWasPressed({ key: event.data.keyDownInIframe, type: "keydown", preventDefault: () => {} })
            }
            else if(event.data.consoleLogFromIframe) {
                console.log(event.data.consoleLogFromIframe)
            }
        })
    }

    this.setUpLiveView = () => {
        this.liveViewElement = document.getElementsByClassName("js-view")[0]
    }

    this.setUpConsole = () => {
        let consoleElement = document.getElementsByClassName("js-console")[0]

        browserLog = window.console.log
        customConsoleLog = function(data, type) {
            if(data instanceof Error) {
                data = data.stack.split(" at ")[1] + data
            } else if(typeof data === "object") {
                try {
                    data = JSON.stringify(data)
                } catch(TypeError) {
                    browserLog(data)
                    console.log("LiveCoding: ^ Also logged this message to console since LiveCoding does not know how to display it.")
                }
            }

            consoleElement.innerHTML = data + "<br/>" + consoleElement.innerHTML
        }

        // TODO: Make this a button in the UI
        if(window.location.href.indexOf("tempEnableRealConsole") == -1) {
            window.console.log = customConsoleLog
        }

        console.log("<br/>LiveCoding: This is a JavaScript live coding environment, for more information see <a href='https://github.com/joakimk/live_coding'>https://github.com/joakimk/live_coding</a>.")
    }

    this.setUpEditor = () => {
        let editorDiv = document.getElementsByClassName("js-editor")[0]
        let editor = ace.edit(editorDiv)

        // TODO: Remove this when possible, the platform game relies on it
        window.editor = editor

        //editor.setTheme("ace/theme/github") // Light theme
        editor.setTheme("ace/theme/twilight") // Dark theme

        // Settings for javascript editing
        editor.setOption("tabSize", 4)
        editor.setOption("useSoftTabs", true)
        editor.session.setMode("ace/mode/javascript")

        editor.session.setUseWrapMode(true)

        // Hide the 80 chars line. No strong reason, mostly because
        // the size of the window is probably a more practical limit for now.
        editor.setShowPrintMargin(false)

        if(window.location.href.indexOf("vim") != -1) {
            editor.setKeyboardHandler("ace/keyboard/vim")
        }

        // Have no looked deeply at this:
        // "Automatically scrolling cursor into view after selection change this will be disabled in the next version set editor.$blockScrolling = Infinity to disable this message"
        editor.$blockScrolling = Infinity

        editor.on("changeStatus", function() {
            if(editor.keyBinding.getStatusText(editor) == "INSERT") { vimInsertMode = true }
            else { if(vimInsertMode) { vimInsertMode = false; runCode(editor) } }
        })
        editor.on("change", () => { runCode(editor) });

        return editor
    }

    this.loadSavedCode = (editor) => {
        savedCode = localStorage.getItem("code")

        if(savedCode) {
            console.log("LiveCoding: Loading previously saved code from local storage")
            editor.setValue(savedCode)

            // Reset undo stack to the saved code instead of the default example :)
            editor.session.setUndoManager(new ace.UndoManager())

            editor.clearSelection()
        } else {
            runCode(editor)
        }

        editor.gotoLine(1)
        editor.focus()

        firstAttemptToLoadCodeHasRun = true
    }

    this.runCode = (editor) => {
        if(vimInsertMode) { return }

        code = editor.getValue()
        if(firstAttemptToLoadCodeHasRun) {
            localStorage.setItem("code", code)
        }

        window.liveCodeVersion += 1

        code =
        "window.liveCodeVersion = " + window.liveCodeVersion + ";" +
        "(function() {" +
        "let liveCoding = {" +
        "  apiVersion: 1" +
        ", codeVersion: " + window.liveCodeVersion +
        ", outputElement: document.body" +
        ", mode: '" + this.mode + "'" +
        "}\n" +

        // Add function that can be used to check if the code is outdated and should stop running.
        "liveCoding.codeHasChanged = function() { return window.liveCodeVersion != liveCoding.codeVersion };" +

        // Save and load state to be able to resume the simulation after live code update
        "liveCoding.saveState = function(state) { window.liveCodingState = state };" +
        "liveCoding.loadStateOrDefaultTo = function(defaultState) { savedState = window.liveCodingState; return savedState ? savedState : defaultState };" +

        "try {" +

        // Load the new version of the code.
        code +

        "\n } catch(e) { console.log(e) }" +
        "})();"

        liveViewElement.contentWindow.loadCode(code)

        // TODO:
        // - add css to highlight when running
    }

    this.fetchFromUrl = (url, callback) => {
        let xmlhttp = new XMLHttpRequest()

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback(xmlhttp.responseText)
            } else if (xmlhttp.status != 0 && xmlhttp.status != 200) {
                console.log("Failed to get " + url + ": " + xmlhttp.responseText + " [" + xmlhttp.status + "]")
            }
        }

        xmlhttp.open("GET", url, true)
        xmlhttp.send()
    }

    this.replaceCodeInEditor = (editor, code) => {
        editor.setValue(code)
        editor.gotoLine(1)
        editor.focus()
    }

    init()
}())
