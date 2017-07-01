module View exposing (view)

import Types exposing (..)
import Helpers exposing (detectCodeUrlType, buildGithubProjectMetadata, buildGithubGistMetaData)
import Html exposing (text, div, p, a, button, input, span, br)
import Html.Attributes exposing (href, value, class, placeholder)
import Html.Events exposing (onClick, onInput)


view : Model -> Html.Html Msg
view model =
    case model.activeSection of
        Start ->
            div
                []
                [ p []
                    [ p []
                        [ input [ class "editor__controls__add-project__input", value model.pendingCodeUrl, placeholder "<< Enter Github URL including path to file or Gist URL here >>", onInput UpdatePendingCodeUrl ] []
                        , text " "
                        , button [ class "editor__controls__add-project__button", onClick AddProject ] [ text "Add project" ]
                        ]
                    ]
                , div [] (List.map renderProjectListItem model.projects)
                ]

        ViewProject project ->
            renderProject project


renderProjectListItem : Project -> Html.Html Msg
renderProjectListItem project =
    p []
        [ span [] [ text (shortFormCodeUrl project) ]
        , text " "
        , button [ onClick (OpenProject project) ] [ text "Open" ]
        ]


renderProject : Project -> Html.Html Msg
renderProject project =
    p []
        [ button [ onClick (LoadCode project) ] [ text "Load code" ]
        , text " <- "
        , span [] [ text (shortFormCodeUrl project) ]
        , br [] []
        , br [] []
        , button [ onClick (RebootPlayer) ] [ text "Reboot the player" ]
        , text " "
        , button [ onClick (RemoveProject project) ] [ text "Delete local code (!)" ]
        , br [] []
        , br [] []
        , button [ onClick (CloseProject) ] [ text "Close project" ]
        , br [] []
        ]


shortFormCodeUrl : Project -> String
shortFormCodeUrl project =
    case (detectCodeUrlType project) of
        Github ->
            let
                githubProjectMetadata =
                    project.codeUrl |> buildGithubProjectMetadata
            in
                "[github] " ++ githubProjectMetadata.user ++ "/" ++ githubProjectMetadata.repo ++ "/" ++ githubProjectMetadata.path

        Gist ->
            let
                gistMetadata =
                    (buildGithubGistMetaData project.codeUrl)
            in
                "[gist] " ++ gistMetadata.user ++ "/" ++ gistMetadata.id

        None ->
            project.codeUrl
