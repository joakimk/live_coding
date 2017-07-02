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
    = UpdatePendingRemoteCodeUrl String
    | AddProject
    | OpenProject Project
    | CloseProject
    | RemoveProject Project
    | LoadCode Project
    | ChangeModeByString String
    | RebootPlayer
    | RemoteCodeLoaded CodeResponse


type alias Model =
    { projects : List Project
    , pendingRemoteCodeUrl : String
    , activeSection : Section
    , mode : Mode
    }


type alias Settings =
    { projects : List SavedProject
    }


type alias Project =
    { --title : String
      remoteCodeUrl : String
    , localFiles : List File
    , remoteFiles : List File
    , fetchingRemoteFiles : Bool
    }


type alias SavedProject =
    { remoteCodeUrl : String
    , localFiles : List File
    }


type alias File =
    { name : String
    , content : String
    }


type alias CodeRequest =
    { projectUrl : String
    , apiUrl : String
    }


type alias CodeResponse =
    { projectUrl : String
    , files : List File
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
