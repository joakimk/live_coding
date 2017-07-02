module Main exposing (..)

-- todo:
-- - See if code can be reloaded by having an iframe to blow away js-state, this would allow nicer Elm UI navigation
-- - Select project and see things for the active project
-- - Have Elm handle code loading, write to local cache and assume multiple files
-- - Save changes from editor through Elm
-- - Load code from local cache when switching projects
-- todo: redo UI, click project to see info and options, also naming for projects
--       delete, load remote, load local, has local changes?, change name, ...
--       handle code loading through Elm?
--       - clicking a project switches to it right away but does not load remote code
-- todo: backup and restore of locally persisted settings?

import Types exposing (Settings, Model, Msg)
import View exposing (view)
import State exposing (init, updateAndSaveSettings, updateMode, remoteCodeLoaded)
import Html


main : Program (Maybe Settings) Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = updateAndSaveSettings
        , subscriptions = \_ -> Sub.batch [ updateMode Types.ChangeModeByString, remoteCodeLoaded Types.RemoteCodeLoaded ]
        }
