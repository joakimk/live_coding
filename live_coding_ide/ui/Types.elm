module Types exposing (..)


type CodeUrlType
    = Github
    | Gist
    | None


type Section
    = Start
    | ViewProject Project


type Mode
    = Editing
    | Playing


type Msg
    = UpdatePendingCodeUrl String
    | AddProject
    | OpenProject Project
    | CloseProject
    | RemoveProject Project
    | LoadCode Project
    | ChangeModeByString String
    | RebootPlayer


type alias Model =
    { projects : List Project
    , pendingCodeUrl : String
    , activeSection : Section
    , mode : Mode
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
