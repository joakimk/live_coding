port module Main exposing (..)

import Html exposing (text, div, p, a, button, input)
import Html.Attributes exposing (href, value, class)
import Html.Events exposing (onClick, onInput)


port loadCodeFromGithub : String -> Cmd msg


port saveSettings : Settings -> Cmd msg


main : Program (Maybe Settings) Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }


type alias Model =
    { settings : Settings
    }


type alias Settings =
    { githubProjectPath : String
    , githubProjectRef : String
    }


type Msg
    = NoOp
    | LoadLatestCode
    | UpdateGithubProjectPath String
    | UpdateGithubProjectRef String


defaultModel : Model
defaultModel =
    { settings =
        { githubProjectPath = "joakimk/live_coding/live_coding_ide/examples/platform_game.js"
        , githubProjectRef = "master"
        }
    }


init : Maybe Settings -> ( Model, Cmd Msg )
init savedSettings =
    { defaultModel | settings = (Maybe.withDefault defaultModel.settings savedSettings) } ! []


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        NoOp ->
            model ! []

        LoadLatestCode ->
            model ! [ model |> buildGithubApiUrl |> loadCodeFromGithub ]

        UpdateGithubProjectPath path ->
            updateSettings model (\settings -> { settings | githubProjectPath = path })

        UpdateGithubProjectRef ref ->
            updateSettings model (\settings -> { settings | githubProjectRef = ref })


updateSettings : Model -> (Settings -> Settings) -> ( Model, Cmd msg )
updateSettings model callback =
    let
        updatedSettings =
            (callback model.settings)
    in
        { model | settings = updatedSettings } ! [ saveSettings updatedSettings ]


buildGithubApiUrl : Model -> String
buildGithubApiUrl model =
    let
        parts =
            model.settings.githubProjectPath |> String.split ("/")

        userAndRepoParts =
            parts |> List.take 2

        pathParts =
            parts |> List.drop 2

        urlParts =
            [ [ "https://api.github.com/repos" ], userAndRepoParts, [ "contents" ], pathParts ]

        url =
            urlParts |> List.concat |> String.join ("/")
    in
        url ++ "?ref=" ++ model.settings.githubProjectRef


view : Model -> Html.Html Msg
view model =
    div
        []
        [ p []
            [ text "JavaScript live coding environment. "
            , a [ href "https://github.com/joakimk/live_coding" ] [ text "https://github.com/joakimk/live_coding" ]
            , p []
                [ button [ class "editor__controls__load-code__button", onClick LoadLatestCode ] [ text "Load from github" ]
                , text " at "
                , input [ class "editor__controls__load-code__input_path", value model.settings.githubProjectPath, onInput UpdateGithubProjectPath ] []
                , text " on "
                , input [ class "editor__controls__load-code__input_ref", value model.settings.githubProjectRef, onInput UpdateGithubProjectRef ] []
                ]
            ]
        ]
