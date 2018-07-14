(function() {
    this.vimInsertMode = false
    this.pendingSuccessfulCodeLoadAfterError = false
    this.liveCodeState = null
    this.liveCodeVersion = 1
    this.liveViewElement = null
    this.liveViewContainerElement = null
    this.mode = "editing" // NOTE: Duplicated in Elm
    this.modeChangedSincePageLoad = false
    this.firstAttemptToLoadCodeHasRun = false
    this.currentProject = null

    this.browserConsoleLog = window.console.log
    this.customConsoleLog = null

    this.showCodeFromWebSocketInFullScreen = window.location.search.split("load_from_ws=")[1]

    init = () => {
        setUpLiveView()

        if(this.showCodeFromWebSocketInFullScreen) {
          let ws = new WebSocket(this.showCodeFromWebSocketInFullScreen)
          let that = this
          ws.onmessage = (event) => {
            that.runCodeFromString(event.data)
          }
        } else {
          setUpConsole()

          let editor = setUpEditor()
          let ui = setUpEditorControlUI(editor)

          setUpCodeLoading(ui)
          setUpModeHandling(editor, ui)
        }
    }

    this.setUpEditorControlUI = () => {
        let node = document.getElementsByClassName("js-editor-controls")[0]
        let settings = localStorage.getItem("settings")

        if(settings) { settings = JSON.parse(settings) }

        // Throw away old incompatible data, remove after juli 2017
        if(settings && settings.githubProjectPath) { settings = null }

        // Migrate old data format
        if(settings) {
            for(i = 0; i < settings.projects.length; i++) {
                let project = settings.projects[i]
                if(project.codeUrl) {
                    settings.projects[i] = { remoteCodeUrl: project.codeUrl, localFiles: project.localFiles }
                }

                if(!project.localFiles) {
                    project.localFiles = []
                    settings.projects[i] = project
                }

            }
        }

        let ui = Elm.Main.embed(node, settings)

        ui.ports.saveSettings.subscribe((settings) => {
            localStorage.setItem("settings", JSON.stringify(settings))
        })

        ui.ports.rebootPlayer.subscribe(() => {
            liveViewElement.contentWindow.location.reload()
        })

        ui.ports.redirectConsoleOutput.subscribe((enable) => {
            liveViewElement.contentWindow.redirectConsoleOutput(enable)
            if(enable) { window.console.log = customConsoleLog }
            else { window.console.log = browserConsoleLog }
        })

        return ui
    }

    this.setUpCodeLoading = (ui) => {
        // NEW way (wip)
        ui.ports.fetchCodeFromGist.subscribe((codeRequest) => {
            fetchFromUrl(codeRequest.apiUrl, function(body) {
                let codeResponse = { projectUrl: codeRequest.projectUrl, files: [], successful: true }

                if(body == "request_failed") {
                    codeResponse.successful = false
                } else {
                    files = Object.values(JSON.parse(body).files)

                    for(i = 0; i < files.length; i++) {
                        codeResponse.files.push({ name: files[i].filename, content: files[i].content })
                    }
                }

                ui.ports.remoteCodeLoaded.send(codeResponse)
            })

        })

        ui.ports.fetchCodeFromGithub.subscribe((codeRequest) => {
            fetchFromUrl(codeRequest.apiUrl, function(body) {
                let codeResponse = { projectUrl: codeRequest.projectUrl, files: [], successful: true }

                if(body == "request_failed") {
                    codeResponse.successful = false
                } else {
                    // https://stackoverflow.com/questions/22587308/convert-iso-8859-1-to-utf-8
                    code = decodeURIComponent(escape(atob(JSON.parse(body).content)))
                    codeResponse.files.push({ name: "file.js", content: code })
                }

                ui.ports.remoteCodeLoaded.send(codeResponse)
            })
        })

        ui.ports.loadCodeInEditor.subscribe((project) => {
            // TODO: why is this called with zero files?
            if(project.localFiles.length == 0) { return }

            if(project.localFiles.length != 1) { alert("Unsupported number of files: " + project.localFiles.length) }

            currentProject = null
            replaceCodeInEditor(editor, project.localFiles[0].content)
            liveViewElement.contentWindow.location.reload()
            currentProject = project
        })

        editor.on("change", () => {
            if(!currentProject) { return }

            project = currentProject

            if(project.localFiles.length != 1) { alert("Unsupported number of files: " + project.localFiles.length) }

            project.localFiles[0].content = editor.getValue()

            ui.ports.codeChangedByUser.send(project)
        });

        // OLD way
        ui.ports.loadCodeFromGithub.subscribe((url) => {
            fetchFromUrl(url, function(body) {
                // https://stackoverflow.com/questions/22587308/convert-iso-8859-1-to-utf-8
                code = decodeURIComponent(escape(atob(JSON.parse(body).content)))

                replaceCodeInEditor(editor, code)

                // Reload the player after loading code as this is often required to get it running
                liveViewElement.contentWindow.location.reload()
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

                    // Reload the player after loading code as this is often required to get it running
                    liveViewElement.contentWindow.location.reload()
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

                classes = liveViewContainerElement.className
                classes = classes.replace(" view__content--playing", "")
                liveViewContainerElement.className = classes
            } else {
                editor.blur()
                liveViewElement.focus()
                liveViewContainerElement.className += " view__content--playing"
            }

            if(modeChangedSincePageLoad) { runCode(editor) }
            modeChangedSincePageLoad = true
        })

        editor.on("focus", function() { ui.ports.updateMode.send("editing") })

        keyWasPressed = (e) => {
            // Prevent default browser behavior for cmd+s / ctrl+s since it's kind of annoying
            // when you're used to saving a lot in other editors. The default behavior
            // brings up a dialog to save the HTML content of the page.
            if(e.code == "KeyS") {
              e.preventDefault()
            }

            // Going back from the editor does not work right now.
            if(e.code == "Backquote") {
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
        if(this.showCodeFromWebSocketInFullScreen) {
          this.liveViewElement = document.getElementsByClassName("js-full-screen-view")[0]
          this.liveViewContainerElement = document.getElementsByClassName("js-full-screen-view-container")[0]

          // Show full screen container and hide (remove) the split screen container
          document.getElementsByClassName("js-full-screen-container")[0].style = "display: block"
          document.getElementsByClassName("js-split-screen-container")[0].innerHTML = ""
        } else {
          this.liveViewElement = document.getElementsByClassName("js-view")[0]
          this.liveViewContainerElement = document.getElementsByClassName("js-view-container")[0]
        }
    }

    this.setUpConsole = () => {
        let consoleElement = document.getElementsByClassName("js-console")[0]

        browserConsoleLog = window.console.log
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

        window.console.log = customConsoleLog

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

        this.runCodeFromString(code)
    }

    this.runCodeFromString = (code) => {
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
    }

    this.fetchFromUrl = (url, callback) => {
        let xmlhttp = new XMLHttpRequest()

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback(xmlhttp.responseText)
            } else if (xmlhttp.status != 0 && xmlhttp.status != 200) {
                callback("request_failed")
                console.log("Failed to get " + url + ": " + xmlhttp.responseText + " [" + xmlhttp.status + "]")
            }
        }

        let divider = url.indexOf("?") != -1 ? "&" : "?"

        // Invalidate cache every 4 seconds instead of the 60 seconds default,
        // since you might want to fetch an update you just did.
        let cacheBuster = parseInt(new Date().getTime() / 4000)
        xmlhttp.open("GET", url + divider + "noCachePlease=" + cacheBuster, true)

        xmlhttp.send()
    }

    this.replaceCodeInEditor = (editor, code) => {
        editor.setValue(code)
        editor.gotoLine(1)
        editor.focus()
    }

    init()
}())
