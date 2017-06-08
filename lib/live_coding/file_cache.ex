defmodule LiveCoding.FileCache do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def read(url) do
    GenServer.call(__MODULE__, {:read, url})
  end

  def write(data, url) do
    GenServer.cast(__MODULE__, {:write, url, data})
    data
  end

  def handle_call({:read, url}, _from, state) do
    {:reply, Map.get(state, url), state}
  end

  def handle_cast({:write, url, data}, state) do
    {:noreply, Map.put(state, url, data)}
  end
end
