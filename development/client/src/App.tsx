import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ColorSchemeGenerator from "./ColorSchemeGenerator";
import Favorites from "./Favorites";
import ColorLookup from "./ColorLookup";
import "./App.css";
import { createApolloClient4Provider } from "./createApolloClient4Provider";
import { createApolloClient3Provider } from "./createApolloClient3Provider";

function App() {
  const [clients, setClients] = useState<
    Array<
      | ReturnType<typeof createApolloClient3Provider>
      | ReturnType<typeof createApolloClient4Provider>
    >
  >(() => [createApolloClient4Provider("Root client")]);
  const [selectedClientIndex, setSelectedClientIndex] = useState(0);

  if (clients.length === 0) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Client was terminated</h1>
        <button
          onClick={() => {
            setClients([createApolloClient3Provider("Root client")]);
          }}
        >
          Recreate client (AC3)
        </button>
        <button
          onClick={() => {
            setClients([createApolloClient4Provider("Root client")]);
          }}
        >
          Recreate client (AC4)
        </button>
      </div>
    );
  }
  let { client, Provider } = clients[selectedClientIndex];
  if (!client) {
    setSelectedClientIndex(0);
    ({ client, Provider } = clients[0]);
  }

  return (
    <Provider>
      <BrowserRouter>
        <div className="App">
          <header style={{ display: "flex" }}>
            <Link to="/">
              <h1>Colors</h1>
            </Link>
            <nav style={{ flex: 1 }}>
              <Link to="/favorites">Favorites</Link>
              <Link to="/lookup">Lookup</Link>
            </nav>
            <div style={{ display: "flex", gap: "1rem" }}>
              <select
                value={clients.findIndex(({ client: c }) => c === client)}
                onChange={(e) => setSelectedClientIndex(Number(e.target.value))}
              >
                {clients.map((_, index) => (
                  <option key={index} value={index}>
                    Client {index}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  setClients((c) => [
                    ...c,
                    createApolloClient3Provider(`Added client ${c.length}`),
                  ])
                }
              >
                Add AC3
              </button>
              <button
                onClick={() =>
                  setClients((c) => [
                    ...c,
                    createApolloClient4Provider(`Added client ${c.length}`),
                  ])
                }
              >
                Add AC4
              </button>
              <button
                onClick={() =>
                  setClients((c) => [...c, createApolloClient3Provider()])
                }
              >
                Add anonymous client (AC3)
              </button>
              <button
                onClick={() =>
                  setClients((c) => [...c, createApolloClient4Provider()])
                }
              >
                Add anonymous client (AC4)
              </button>
              <button
                onClick={() => {
                  client.stop();
                  setClients((c) => [
                    ...c.slice(0, selectedClientIndex),
                    client instanceof createApolloClient3Provider.ClientClass
                      ? createApolloClient3Provider(
                          `Recreated AC3 ${selectedClientIndex}`
                        )
                      : createApolloClient4Provider(
                          `Recreated AC4 ${selectedClientIndex}`
                        ),
                    ...c.slice(selectedClientIndex + 1),
                  ]);
                }}
              >
                Recreate client
              </button>
              <button
                onClick={() => {
                  client.stop();
                  setClients((clients) =>
                    clients.filter(({ client: c }) => c !== client)
                  );
                  setSelectedClientIndex(0);
                }}
              >
                Terminate client
              </button>
            </div>
          </header>
          <main>
            <Routes>
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/lookup" element={<ColorLookup />} />
              <Route path="/" element={<ColorSchemeGenerator />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
