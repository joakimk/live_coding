module Main exposing (..)

-- todo: load multiple files?
-- todo: redo UI, click project to see info and options, also naming for projects
--       delete, load remote, load local, has local changes?, change name, ...
--       handle code loading through Elm?
--       - clicking a project switches to it right away but does not load remote code
-- todo: backup and restore of locally persisted settings?

import Types exposing (Settings, Model, Msg)
import View exposing (view)
import State exposing (init, updateAndSaveSettings)
import Html


main : Program (Maybe Settings) Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = updateAndSaveSettings
        , subscriptions = \_ -> Sub.none
        }
