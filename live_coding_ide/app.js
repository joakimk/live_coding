(function() {
  this.vimInsertMode = false
  this.pendingSuccessfulCodeLoadAfterError = false
  this.liveCodeState = null
  this.liveCodeVersion = 1

  this.liveViewElement = null


  init = () => {
    setUpLiveView()
    setUpConsole()

    let editor = setUpEditor()
    loadSavedCode(editor)
    setUpCodeLoadingFromGists(editor)

    setUpEditorControlUI()
  }

  this.setUpEditorControlUI = () => {
    let node = document.getElementsByClassName("js-editor-controls")[0]
    let settings = { githubProjectPath: localStorage.getItem("githubProjectPath") }
    if(!settings.githubProjectPath) { settings = null } // limitation in Elm code so far
    let app = Elm.Main.embed(node, settings)

    app.ports.saveGithubProjectPath.subscribe((path) => {
      localStorage.setItem("githubProjectPath", path)
    })

    app.ports.loadCodeFromGithub.subscribe((url) => {
      fetchFromUrl(url, function(body) {
        replaceCodeInEditor(atob(JSON.parse(body).content))

        // Reload page after replacing code as this is often required to get it running
        window.location.reload()
      })
    })
  }

  this.setUpLiveView = () => {
    this.liveViewElement = document.getElementsByClassName("js-view")[0]
  }

  this.setUpConsole = () => {
    let consoleElement = document.getElementsByClassName("js-console")[0]

    // Catch runtime errors (code loading errors are handled in runCode)
    window.onerror = function(e) { console.log("LiveCoding: " + e) };

    window.console.log = function(data, type) {
      if(data instanceof Error) {
        data = data.stack.split(" at ")[1] + data
      } else if(typeof data === "object") {
        data = JSON.stringify(data)
      }

      consoleElement.innerHTML = data + "<br/>" + consoleElement.innerHTML
    }
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
  }

  this.setUpCodeLoadingFromGists = (editor) => {
    // Proof of concept code loading from gist
    if(location.href.indexOf("import_from_gist") != -1) {
       let url = location.href.split("import_from_gist=")[1].replace("gist.github.com", "gist.githubusercontent.com") + "/raw"

       if(window.confirm("Are you sure you want to import " + url + " and run it?")) {
         fetchFromUrl(url, function(code) {
           replaceCodeInEditor(code)

           // Reload page after replacing code as this is often required to get it running
           window.location = location.href.split("import_from_gist=")[0]
         })
       } else {
         window.location = location.href.split("import_from_gist=")[0]
       }
    }
  }

  this.runCode = (editor) => {
    if(vimInsertMode) { return }

    code = editor.getValue()

    script = document.createElement("script")
    script.type = "text/javascript"

    localStorage.setItem("code", code)

    window.liveCodeVersion += 1

    script.innerHTML =
      "(function() {" +
        // Add function that can be used to check if the code is outdated and should stop running.
        "function codeHasChanged() { return " + this.liveCodeVersion + " != this.liveCodeVersion };" +

        // Save and load state to be able to resume the simulation after live code update
        "function saveState(state) { this.liveCodeState = state };" +
        "function loadStateOrDefaultTo(defaultState) { savedState = this.liveCodeState; return savedState ? savedState : defaultState }; try { " +

        // Load the new version of the code.
        code +

        "\nif(this.pendingSuccessfulCodeLoadAfterError) { this.pendingSuccessfulCodeLoadAfterError = false; console.log('LiveCoding: Code now loads successfully again!') }" +
        " } catch(e) { this.pendingSuccessfulCodeLoadAfterError = true; console.log(e) }" +
      "})();"

    document.body.appendChild(script)
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

  this.replaceCodeInEditor = (code) => {
    // https://stackoverflow.com/questions/22587308/convert-iso-8859-1-to-utf-8
    editor.setValue(decodeURIComponent(escape(code)))
    editor.gotoLine(1)
    editor.focus()
  }

  init()
}())
