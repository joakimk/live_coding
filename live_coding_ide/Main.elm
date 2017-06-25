port module Main exposing (..)

import Html exposing (text, div, p, a, button)
import Html.Attributes exposing (href)
import Html.Events exposing (onClick)


port loadCodeFromGithub : String -> Cmd msg


main : Program (Maybe Model) Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }


type alias Model =
    {}


type Msg
    = NoOp
    | LoadLatestCode


init : Maybe Model -> ( Model, Cmd Msg )
init savedModel =
    Maybe.withDefault {} savedModel ! []


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        NoOp ->
            model ! []

        LoadLatestCode ->
            model ! [ loadCodeFromGithub "https://api.github.com/repos/joakimk/live_coding/contents/live_coding_ide/examples/platform_game.js?ref=master" ]


view : Model -> Html.Html Msg
view model =
    div
        []
        [ p []
            [ text "JavaScript live coding environment. "
            , a [ href "https://github.com/joakimk/live_coding" ] [ text "https://github.com/joakimk/live_coding" ]
            , p []
                [ button [ onClick LoadLatestCode ] [ text "Load latest code" ]
                , text " from github.com/joakimk/live_coding/live_coding_ide/examples/platform_game.js [master]"
                ]
            ]
        ]
