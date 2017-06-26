port module Main exposing (..)

import Html exposing (text, div, p, a, button, input)
import Html.Attributes exposing (href, value, class)
import Html.Events exposing (onClick, onInput)


port loadCodeFromGithub : String -> Cmd msg


port saveGithubProjectPath : String -> Cmd msg


main : Program (Maybe Model) Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }


type alias Model =
    { githubProjectPath : String
    }


type Msg
    = NoOp
    | LoadLatestCode
    | UpdateGithubProjectPath String


defaultModel : Model
defaultModel =
    { githubProjectPath = "joakimk/live_coding/contents/live_coding_ide/examples/platform_game.js?ref=master"
    }


init : Maybe Model -> ( Model, Cmd Msg )
init savedModel =
    Maybe.withDefault defaultModel savedModel ! []


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        NoOp ->
            model ! []

        LoadLatestCode ->
            model ! [ loadCodeFromGithub ("https://api.github.com/repos/" ++ model.githubProjectPath) ]

        UpdateGithubProjectPath path ->
            { model | githubProjectPath = path } ! [ saveGithubProjectPath path ]


view : Model -> Html.Html Msg
view model =
    div
        []
        [ p []
            [ text "JavaScript live coding environment. "
            , a [ href "https://github.com/joakimk/live_coding" ] [ text "https://github.com/joakimk/live_coding" ]
            , p []
                [ button [ class "editor__controls__load-code__button", onClick LoadLatestCode ] [ text "Load from github" ]
                  -- TODO: Path and branch as separate to remove github API-specifics, also be able to load from gist here
                , input [ class "editor__controls__load-code__input", value model.githubProjectPath, onInput UpdateGithubProjectPath ] []
                ]
            ]
        ]
