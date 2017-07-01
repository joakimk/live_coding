port module State exposing (init, updateAndSaveSettings, updateMode)

import Types exposing (..)
import Helpers exposing (detectCodeUrlType, buildGithubProjectMetadata, buildGithubProjectApiUrl, buildGithubGistMetaData, buildGithubGistApiUrl)


port loadCodeFromGithub : String -> Cmd msg


port loadCodeFromGist : String -> Cmd msg


port saveSettings : Settings -> Cmd msg


port rebootPlayer : String -> Cmd msg


port modeChangedTo : String -> Cmd msg


port updateMode : (String -> msg) -> Sub msg


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        LoadCode project ->
            model ! (loadCodeFromProject project)

        UpdatePendingCodeUrl url ->
            { model | pendingCodeUrl = url } ! []

        RemoveProject project ->
            let
                projects =
                    List.filter (\p -> p /= project) model.projects
            in
                { model | projects = projects, activeSection = Start } ! []

        AddProject ->
            let
                projects =
                    { codeUrl = model.pendingCodeUrl } :: model.projects
            in
                { model | projects = projects, pendingCodeUrl = "" } ! []

        OpenProject project ->
            { model | activeSection = ViewProject project } ! []

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


restoreSettings : Model -> Settings -> Model
restoreSettings model settings =
    -- We handle settings this way so that we don't need to care what is being
    -- persisted when working with the data. It also allows us to have less nesting
    -- in the Model data which is easier to work with in Elm
    --
    -- It also allows conditional logic when dumping or restoring settings if
    -- we want that at some point.
    { defaultModel | projects = settings.projects }


dumpSettings : Model -> Settings
dumpSettings model =
    { projects = model.projects }


loadCodeFromProject : Project -> List (Cmd msg)
loadCodeFromProject project =
    case (detectCodeUrlType project) of
        Github ->
            [ project.codeUrl |> buildGithubProjectMetadata |> buildGithubProjectApiUrl |> loadCodeFromGithub ]

        Gist ->
            [ project.codeUrl |> buildGithubGistMetaData |> buildGithubGistApiUrl |> loadCodeFromGist ]

        None ->
            []


defaultModel : Model
defaultModel =
    { pendingCodeUrl = ""
    , projects = []
    , activeSection = Start
    , mode = Editing
    }


defaultSettings : Settings
defaultSettings =
    { projects =
        --, "https://gist.github.com/joakimk/a8b2c1d67e20e7963739fc8ae3a49714"
        --, "https://gist.github.com/joakimk/a8b2c1d67e20e7963739fc8ae3a49714/0000ded16a016d21116b904223a55da8d5f0193b"
        [ { codeUrl = "https://github.com/joakimk/live_coding/blob/master/live_coding_ide/examples/platform_game.js" }
        , { codeUrl = "https://github.com/joakimk/live_coding/blob/master/live_coding_ide/examples/effect_demo.js" }
        , { codeUrl = "https://github.com/joakimk/live_coding/blob/master/live_coding_ide/examples/pixijs.js" }
        , { codeUrl = "https://github.com/joakimk/live_coding/blob/master/live_coding_ide/examples/fabric.js" }
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
