module Main exposing (..)

-- todo:
-- identify projects by something other than remoteCodeUrl to allow local projects
-- always have a project loaded, have a default one
-- naming for projects
-- clone projects
-- be able to change the remoteCodeUrl
-- rewrite more of the js code in elm, console, api calls?
-- todo: backup and restore of locally persisted settings?

import Types exposing (Settings, Model, Msg)
import View exposing (view)
import State exposing (init, updateAndSaveSettings, updateMode, remoteCodeLoaded, codeChangedByUser)
import Html


main : Program (Maybe Settings) Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = updateAndSaveSettings
        , subscriptions =
            \_ ->
                Sub.batch
                    [ updateMode Types.ChangeModeByString
                    , remoteCodeLoaded Types.RemoteCodeLoaded
                    , codeChangedByUser Types.CodeChangedByUser
                    ]
        }
