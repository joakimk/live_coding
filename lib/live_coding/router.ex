defmodule LiveCoding.Router do
  use Plug.Router
  require Logger

  plug Plug.Logger
  plug :match
  plug :dispatch

  get "/" do
    send_file(conn, 200, "live_coding_ide/index.html")
  end

  get "/app.js" do
    send_file(conn, 200, "live_coding_ide/app.js")
  end

  get "/app.css" do
    send_file(conn, 200, "live_coding_ide/app.css")
  end

  get "/ace-editor/:file" do
    path = "live_coding_ide/ace-editor/" <> (conn.params["file"] |> String.replace("..", ""))
    send_file(conn, 200, path)
  end

  match _ do
    send_resp(conn, 404, "Page not found")
  end
end
