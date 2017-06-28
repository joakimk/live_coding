port module Main exposing (..)

import Html exposing (text, div, p, a, button, input, span)
import Html.Attributes exposing (href, value, class, placeholder)
import Html.Events exposing (onClick, onInput)


port loadCodeFromGithub : String -> Cmd msg


port saveSettings : Settings -> Cmd msg


main : Program (Maybe Settings) Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = updateAndSaveSettings
        , subscriptions = \_ -> Sub.none
        }


type alias Model =
    { projects : List Project
    , pendingCodeUrl : String
    }


type alias Settings =
    { projects : List Project
    }


type alias Project =
    { --title : String
      codeUrl : String
    }


type alias GithubProjectUrl =
    { ref : String
    , user : String
    , repo : String
    , path : String
    }


type Msg
    = UpdatePendingCodeUrl String
    | AddProject
    | RemoveProject Project
    | LoadCode Project


defaultModel : Model
defaultModel =
    { pendingCodeUrl = ""
    , projects = []
    }


defaultSettings : Settings
defaultSettings =
    { projects =
        --, "https://gist.github.com/joakimk/a8b2c1d67e20e7963739fc8ae3a49714"
        --, "https://gist.github.com/joakimk/a8b2c1d67e20e7963739fc8ae3a49714/0000ded16a016d21116b904223a55da8d5f0193b"
        [ { codeUrl = "https://github.com/joakimk/live_coding/blob/master/live_coding_ide/examples/platform_game.js" }
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


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        LoadCode project ->
            model ! [ project.codeUrl |> buildGithubProjectUrl |> buildGithubApiUrl |> loadCodeFromGithub ]

        UpdatePendingCodeUrl url ->
            { model | pendingCodeUrl = url } ! []

        RemoveProject project ->
            let
                projects =
                    List.filter (\p -> p /= project) model.projects
            in
                { model | projects = projects } ! []

        AddProject ->
            let
                projects =
                    { codeUrl = model.pendingCodeUrl } :: model.projects
            in
                { model | projects = projects, pendingCodeUrl = "" } ! []


buildGithubApiUrl : GithubProjectUrl -> String
buildGithubApiUrl projectUrl =
    let
        apiUrl =
            [ "https://api.github.com/repos", projectUrl.user, projectUrl.repo, "contents", projectUrl.path ]
                |> String.join ("/")
    in
        apiUrl ++ "?ref=" ++ projectUrl.ref


buildGithubProjectUrl : String -> GithubProjectUrl
buildGithubProjectUrl url =
    let
        parts =
            url |> (String.split "/")

        userAndRepoParts =
            parts |> List.drop 3 |> List.take 2

        user =
            userAndRepoParts |> List.take 1 |> List.head |> Maybe.withDefault "user"

        repo =
            userAndRepoParts |> List.reverse |> List.head |> Maybe.withDefault "repo"

        path =
            parts |> List.drop 3 |> List.drop 2 |> List.drop 2 |> String.join ("/")

        ref =
            parts |> List.drop 3 |> List.drop 2 |> List.drop 1 |> List.take 1 |> List.head |> Maybe.withDefault "master"
    in
        { ref = ref, user = user, repo = repo, path = path }


view : Model -> Html.Html Msg
view model =
    div
        []
        [ p []
            [ text "JavaScript live coding environment. "
            , a [ href "https://github.com/joakimk/live_coding" ] [ text "https://github.com/joakimk/live_coding" ]
            , p []
                [ input [ class "editor__controls__add-project__input", value model.pendingCodeUrl, placeholder "<< Enter Github URL including path to file here >>", onInput UpdatePendingCodeUrl ] []
                , text " "
                , button [ class "editor__controls__add-project__button", onClick AddProject ] [ text "Add project" ]
                ]
            ]
        , div [] (List.map renderProject model.projects)
          -- todo: gist
          -- todo: add-project-by-url?
          -- todo: break code out into modules
        ]


renderProject : Project -> Html.Html Msg
renderProject project =
    p []
        [ span [] [ text (shortFormCodeUrl project) ]
        , text " "
        , button [ onClick (RemoveProject project) ] [ text "X" ]
        , button [ onClick (LoadCode project) ] [ text "Load code" ]
        ]


shortFormCodeUrl : Project -> String
shortFormCodeUrl project =
    let
        projectUrl =
            project.codeUrl |> buildGithubProjectUrl
    in
        "[github] " ++ projectUrl.user ++ "/" ++ projectUrl.repo ++ "/" ++ projectUrl.path
