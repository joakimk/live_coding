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


type RemoteFilesStatus
    = Pending
    | Successful
    | Failed
    | NotRunYet


type Msg
    = UpdatePendingRemoteCodeUrl String
    | AddProject
    | CloseProject
    | ChangeModeByString String
    | RebootPlayer
    | RemoteCodeLoaded CodeResponse
    | CodeChangedByUser SavedProject
    | OpenProject Project
    | RemoveProject Project
    | LoadCode Project
    | ReplaceLocalFilesWithRemoteFiles Project
    | FetchRemoteFiles Project
    | ToggleConsoleOutput


type alias Model =
    { projects : List Project
    , pendingRemoteCodeUrl : String
    , activeSection : Section
    , mode : Mode
    , redirectConsoleOutput : Bool
    }


type alias Settings =
    { projects : List SavedProject
    }


type alias Project =
    { --title : String
      remoteCodeUrl : String
    , localFiles : List File
    , remoteFiles : List File
    , remoteFilesStatus : RemoteFilesStatus
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
    , successful : Bool
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
