module Helpers exposing (..)

import Types exposing (..)


detectCodeUrlType : Project -> CodeUrlType
detectCodeUrlType project =
    if project.codeUrl |> String.contains "https://github.com/" then
        Github
    else if project.codeUrl |> String.contains "https://gist.github.com/" then
        Gist
    else
        None


buildGithubApiUrl : GithubProjectMetadata -> String
buildGithubApiUrl githubProjectMetadata =
    let
        apiUrl =
            [ "https://api.github.com/repos", githubProjectMetadata.user, githubProjectMetadata.repo, "contents", githubProjectMetadata.path ]
                |> String.join ("/")
    in
        apiUrl ++ "?ref=" ++ githubProjectMetadata.ref


buildGithubProjectMetadata : String -> GithubProjectMetadata
buildGithubProjectMetadata url =
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


buildGithubGistMetaData : String -> GithubGistMetadata
buildGithubGistMetaData codeUrl =
    let
        parts =
            codeUrl |> String.split "/" |> List.reverse

        id =
            parts |> List.head |> Maybe.withDefault "unknown-gist-id"

        user =
            parts |> List.drop 1 |> List.head |> Maybe.withDefault "unknown-user"
    in
        { id = id, user = user }


buildGithubGistApiUrl : GithubGistMetadata -> String
buildGithubGistApiUrl gistMetadata =
    "https://api.github.com/gists/" ++ gistMetadata.id
