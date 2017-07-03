module View exposing (view)

import Types exposing (..)
import Helpers exposing (detectCodeUrlType, buildGithubProjectMetadata, buildGithubGistMetaData, reloadProject)
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
                        [ input [ class "editor__controls__add-project__input", value model.pendingRemoteCodeUrl, placeholder "<< Enter Github URL including path to file or Gist URL here >>", onInput UpdatePendingRemoteCodeUrl ] []
                        , text " "
                        , button [ class "editor__controls__add-project__button", onClick AddProject ] [ text "Add project" ]
                        ]
                    ]
                , div [] (List.map renderProjectListItem model.projects)
                ]

        ViewProject project ->
            renderProject (reloadProject model.projects project)


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
        , br [] []
        , renderRemoteStatus project
        , br [] []
        , button [ onClick (FetchRemoteFiles project) ] [ text "Check for updates" ]
        ]


renderRemoteStatus : Project -> Html.Html Msg
renderRemoteStatus project =
    case project.remoteFilesStatus of
        Pending ->
            div [] [ text "WIP: Fetching code..." ]

        Successful ->
            showButtonOrStatusForLocalVsRemoteFiles project

        Failed ->
            div [] [ text "WIP: Fetching code failed :(" ]

        NotRunYet ->
            div [] []


showButtonOrStatusForLocalVsRemoteFiles : Project -> Html.Html Msg
showButtonOrStatusForLocalVsRemoteFiles project =
    if project.localFiles == project.remoteFiles then
        div [] [ text "WIP: No changes since remote code was loaded." ]
    else if (project.localFiles |> List.length) == 0 then
        div []
            [ div [] [ text "WIP: This project is empty." ]
            , button [ onClick (ReplaceLocalFilesWithRemoteFiles project) ] [ text "Load code" ]
            ]
    else
        div []
            [ div [] [ text "WIP: Local code differs from remote code." ]
            , button [ onClick (ReplaceLocalFilesWithRemoteFiles project) ] [ text "Load code (replaces the current code)" ]
            ]


shortFormCodeUrl : Project -> String
shortFormCodeUrl project =
    case (detectCodeUrlType project) of
        Github ->
            let
                githubProjectMetadata =
                    project.remoteCodeUrl |> buildGithubProjectMetadata
            in
                "[github] " ++ githubProjectMetadata.user ++ "/" ++ githubProjectMetadata.repo ++ "/" ++ githubProjectMetadata.path

        Gist ->
            let
                gistMetadata =
                    (buildGithubGistMetaData project.remoteCodeUrl)
            in
                "[gist] " ++ gistMetadata.user ++ "/" ++ gistMetadata.id

        None ->
            project.remoteCodeUrl
