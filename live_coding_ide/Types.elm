module Types exposing (..)


type CodeUrlType
    = Github
    | Gist
    | None


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


type alias GithubProjectMetadata =
    { ref : String
    , user : String
    , repo : String
    , path : String
    }


type alias GithubGistMetadata =
    { user : String
    , id : String
    }


type Msg
    = UpdatePendingCodeUrl String
    | AddProject
    | RemoveProject Project
    | LoadCode Project
