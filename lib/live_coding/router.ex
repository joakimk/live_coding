defmodule LiveCoding.Router do
  use Plug.Router
  require Logger

  plug Plug.Logger
  plug :match
  plug :dispatch


  get "/" do
    send_file(conn, 200, "index.html")
  end

  # todo:
  # - proxy
  # - cache for a limited time or limited memory?
  # - cors only this app
  get "/api/v1/cached_file" do
    data =
      conn
      |> fetch_query_params
      |> Map.get(:query_params)
      |> Map.get("source_url")
      |> fetch_from_cache_or_download_and_write_to_cache

    send_resp(conn, 200, data)
  end

  get "/ace-editor/:file" do
    path = "public/ace-editor/" <> (conn.params["file"] |> String.replace("..", ""))
    send_file(conn, 200, path)
  end

  match _ do
    send_resp(conn, 404, "Page not found")
  end

  defp fetch_from_cache_or_download_and_write_to_cache(url) do
    url
    |> LiveCoding.FileCache.read
    |> fetch_from_cache_or_download_and_write_to_cache(url)
  end
  def fetch_from_cache_or_download_and_write_to_cache(nil, url) do
    url
    |> HTTPoison.get!
    |> Map.get(:body)
    |> LiveCoding.FileCache.write(url)
  end
  def fetch_from_cache_or_download_and_write_to_cache(cached_data, url), do: cached_data
end
