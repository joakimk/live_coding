port module State exposing (init, updateAndSaveSettings, updateMode, remoteCodeLoaded, codeChangedByUser)

import Types exposing (..)
import Helpers exposing (detectCodeUrlType, buildGithubProjectMetadata, buildGithubProjectApiUrl, buildGithubGistMetaData, buildGithubGistApiUrl, reloadProject)


port loadCodeFromGithub : String -> Cmd msg


port loadCodeFromGist : String -> Cmd msg


port fetchCodeFromGithub : CodeRequest -> Cmd msg


port fetchCodeFromGist : CodeRequest -> Cmd msg


port redirectConsoleOutput : Bool -> Cmd msg


port saveSettings : Settings -> Cmd msg


port rebootPlayer : String -> Cmd msg


port modeChangedTo : String -> Cmd msg


port loadCodeInEditor : SavedProject -> Cmd msg


port updateMode : (String -> msg) -> Sub msg


port remoteCodeLoaded : (CodeResponse -> msg) -> Sub msg


port codeChangedByUser : (SavedProject -> msg) -> Sub msg


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        LoadCode project ->
            model ! (loadCodeFromProject project)

        UpdatePendingRemoteCodeUrl url ->
            { model | pendingRemoteCodeUrl = url } ! []

        RemoveProject project ->
            let
                projects =
                    List.filter (\p -> p /= project) model.projects
            in
                { model | projects = projects, activeSection = Start } ! []

        AddProject ->
            let
                projects =
                    { remoteFilesStatus = NotRunYet, localFiles = [], remoteFiles = [], remoteCodeUrl = model.pendingRemoteCodeUrl } :: model.projects
            in
                { model | projects = projects, pendingRemoteCodeUrl = "" } ! []

        OpenProject project ->
            { model | projects = (setRemoteFilesStatusToPending model.projects project), activeSection = ViewProject project }
                ! ([ fetchRemoteFiles project, [ loadCodeInEditor { remoteCodeUrl = project.remoteCodeUrl, localFiles = project.localFiles } ] ] |> List.concat)

        FetchRemoteFiles project ->
            { model | projects = (setRemoteFilesStatusToPending model.projects project) } ! fetchRemoteFiles project

        CloseProject ->
            { model | activeSection = Start } ! []

        ChangeModeByString modeString ->
            case modeString of
                "editing" ->
                    { model | mode = Editing } ! [ modeChangedTo "editing" ]

                "playing" ->
                    { model | mode = Playing } ! [ modeChangedTo "playing" ]

                _ ->
                    Debug.crash "If we get here then we have bad js"

        RebootPlayer ->
            model ! [ rebootPlayer "" ]

        RemoteCodeLoaded codeResponse ->
            let
                projects =
                    model.projects
                        |> List.map
                            (\p ->
                                if p.remoteCodeUrl == codeResponse.projectUrl then
                                    if codeResponse.successful then
                                        { p | remoteFiles = codeResponse.files, remoteFilesStatus = Successful }
                                    else
                                        { p | remoteFilesStatus = Failed }
                                else
                                    p
                            )
            in
                { model | projects = projects } ! []

        ReplaceLocalFilesWithRemoteFiles project ->
            let
                projects =
                    model.projects
                        |> List.map
                            (\p ->
                                if p == project then
                                    { project | localFiles = project.remoteFiles }
                                else
                                    p
                            )

                updatedProject =
                    (reloadProject projects project)
            in
                { model | projects = projects } ! [ loadCodeInEditor { remoteCodeUrl = project.remoteCodeUrl, localFiles = updatedProject.localFiles } ]

        CodeChangedByUser project ->
            let
                projects =
                    model.projects
                        |> List.map
                            (\p ->
                                if p.remoteCodeUrl == project.remoteCodeUrl then
                                    { p | localFiles = project.localFiles }
                                else
                                    p
                            )
            in
                { model | projects = projects } ! []

        ToggleConsoleOutput ->
            { model | redirectConsoleOutput = not model.redirectConsoleOutput } ! [ redirectConsoleOutput (not model.redirectConsoleOutput) ]


setRemoteFilesStatusToPending : List Project -> Project -> List Project
setRemoteFilesStatusToPending projects project =
    projects
        |> List.map
            (\p ->
                if p.remoteCodeUrl == project.remoteCodeUrl then
                    { p | remoteFilesStatus = Pending }
                else
                    p
            )


restoreSettings : Model -> Settings -> Model
restoreSettings model settings =
    -- We handle settings this way so that we don't need to care what is being
    -- persisted when working with the data. It also allows us to have less nesting
    -- in the Model data which is easier to work with in Elm
    --
    -- It also allows conditional logic when dumping or restoring settings if
    -- we want that at some point.
    { defaultModel
        | projects =
            settings.projects
                |> List.map
                    (\p ->
                        { localFiles = p.localFiles
                        , remoteCodeUrl = p.remoteCodeUrl
                        , remoteFiles = []
                        , remoteFilesStatus = NotRunYet
                        }
                    )
    }


dumpSettings : Model -> Settings
dumpSettings model =
    { projects = model.projects |> List.map (\p -> { remoteCodeUrl = p.remoteCodeUrl, localFiles = p.localFiles }) }


fetchRemoteFiles : Project -> List (Cmd msg)
fetchRemoteFiles project =
    case (detectCodeUrlType project) of
        Github ->
            [ project.remoteCodeUrl |> buildGithubProjectMetadata |> buildGithubProjectApiUrl |> wrapInCodeRequest project |> fetchCodeFromGithub ]

        Gist ->
            [ project.remoteCodeUrl |> buildGithubGistMetaData |> buildGithubGistApiUrl |> wrapInCodeRequest project |> fetchCodeFromGist ]

        None ->
            []


wrapInCodeRequest : Project -> String -> CodeRequest
wrapInCodeRequest project apiUrl =
    { projectUrl = project.remoteCodeUrl, apiUrl = apiUrl }


loadCodeFromProject : Project -> List (Cmd msg)
loadCodeFromProject project =
    case (detectCodeUrlType project) of
        Github ->
            [ project.remoteCodeUrl |> buildGithubProjectMetadata |> buildGithubProjectApiUrl |> loadCodeFromGithub ]

        Gist ->
            [ project.remoteCodeUrl |> buildGithubGistMetaData |> buildGithubGistApiUrl |> loadCodeFromGist ]

        None ->
            []


defaultModel : Model
defaultModel =
    { pendingRemoteCodeUrl = ""
    , projects = []
    , activeSection = Start
    , mode = Editing
    , redirectConsoleOutput = True
    }


defaultSettings : Settings
defaultSettings =
    { projects =
        --, "https://gist.github.com/joakimk/a8b2c1d67e20e7963739fc8ae3a49714"
        --, "https://gist.github.com/joakimk/a8b2c1d67e20e7963739fc8ae3a49714/0000ded16a016d21116b904223a55da8d5f0193b"
        [ { localFiles = [], remoteCodeUrl = "https://github.com/joakimk/live_coding/blob/master/live_coding_ide/examples/platform_game.js" }
        , { localFiles = [], remoteCodeUrl = "https://github.com/joakimk/live_coding/blob/master/live_coding_ide/examples/effect_demo.js" }
        , { localFiles = [], remoteCodeUrl = "https://github.com/joakimk/live_coding/blob/master/live_coding_ide/examples/pixijs.js" }
        , { localFiles = [], remoteCodeUrl = "https://github.com/joakimk/live_coding/blob/master/live_coding_ide/examples/fabric.js" }
        ]
    }


init : Maybe Settings -> ( Model, Cmd Msg )
init savedSettings =
    let
        settings =
            (Maybe.withDefault defaultSettings savedSettings)
    in
        (restoreSettings defaultModel settings) ! []


updateAndSaveSettings : Msg -> Model -> ( Model, Cmd msg )
updateAndSaveSettings msg model =
    let
        ( newModel, cmds ) =
            update msg model
    in
        ( newModel
        , Cmd.batch [ saveSettings (dumpSettings newModel), cmds ]
        )
