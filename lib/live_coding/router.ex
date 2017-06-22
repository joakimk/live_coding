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

  get "/gist/:id" do
    "https://api.github.com/gists/" <> conn.params["id"]
    |> load_gist(conn)
  end

  get "/gist/:id/:sha" do
    "https://api.github.com/gists/" <> conn.params["id"] <> "/" <> conn.params["sha"]
    |> load_gist(conn)
  end

  get "/github/:user/:project" do
    conn = conn |> fetch_query_params
    url = "https://api.github.com/repos/#{conn.params["user"]}/#{conn.params["project"]}/contents/#{conn.params["path"] || ""}?ref=#{conn.params["ref"] || "master"}"

    {:ok, response} = HTTPoison.get(url)

    IO.inspect response

    data = response.body
    data = data |> Poison.decode!
    data = data["content"] |> String.replace("\n", "") |> Base.decode64!

    send_resp(conn, 200, data)
  end

  match _ do
    send_resp(conn, 404, "Page not found")
  end

  defp load_gist(url, conn) do
    {:ok, response} = HTTPoison.get(url)

    data = response.body |> Poison.decode! |> Map.fetch!("files") |> Map.fetch!("code.js") |> Map.fetch!("content")

    send_resp(conn, 200, data)

    #|> fetch_data_from_json_url
    #|> load_project_from_gist
    #|> send_project_response(conn)
  end
end
