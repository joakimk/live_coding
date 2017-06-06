defmodule LiveCoding.Router do
  use Plug.Router
  require Logger

  plug Plug.Logger
  plug :match
  plug :dispatch

  get "/" do
    send_file(conn, 200, "index.html")
  end

  match _ do
    send_resp(conn, 404, "Page not found")
  end
end
