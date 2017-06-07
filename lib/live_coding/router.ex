defmodule LiveCoding.Router do
  use Plug.Router
  require Logger

  plug Plug.Logger
  plug :match
  plug :dispatch

  get "/" do
    send_file(conn, 200, "index.html")
  end

  get "/ace-editor/:file" do
    path = "public/ace-editor/" <> (conn.params["file"] |> String.replace("..", ""))
    send_file(conn, 200, path)
  end

  match _ do
    send_resp(conn, 404, "Page not found")
  end
end
