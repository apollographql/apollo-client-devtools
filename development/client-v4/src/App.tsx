import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import type { Reference } from "@apollo/client";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { Defer20220824Handler } from "@apollo/client/incremental";
import { makeReference } from "@apollo/client/utilities/internal";
import { ApolloProvider } from "@apollo/client/react";
import ColorSchemeGenerator from "./ColorSchemeGenerator";
import Favorites from "./Favorites";
import ColorLookup from "./ColorLookup";
import "./App.css";
import { LocalState } from "@apollo/client/local-state";

function App() {
  const [clients, setClients] = useState(() => [createClient("Root client")]);
  const [selectedClientIndex, setSelectedClientIndex] = useState(0);
  let client = clients[selectedClientIndex];

  if (clients.length === 0) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Client was terminated</h1>
        <button
          onClick={() => {
            setClients([createClient("Root client")]);
          }}
        >
          Recreate client
        </button>
      </div>
    );
  }

  if (!client) {
    setSelectedClientIndex(0);
    client = clients[0];
  }

  return (
    <ApolloProvider client={client}>
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
                value={clients.indexOf(client)}
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
                    createClient(`Added client ${c.length}`),
                  ])
                }
              >
                Add client
              </button>
              <button onClick={() => setClients((c) => [...c, createClient()])}>
                Add anonymous client
              </button>
              <button
                onClick={() => {
                  client.stop();
                  setClients((c) => [
                    ...c.slice(0, selectedClientIndex),
                    createClient(`Recreated client ${selectedClientIndex}`),
                    ...c.slice(selectedClientIndex + 1),
                  ]);
                }}
              >
                Recreate client
              </button>
              <button
                onClick={() => {
                  client.stop();
                  setClients((clients) => clients.filter((c) => c !== client));
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
    </ApolloProvider>
  );
}

function createClient(name?: string) {
  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Color: {
          keyFields: ["hex"],
          fields: {
            saved: {
              read(_, { readField }) {
                const hex = readField("hex");
                const favoritedColors: ReadonlyArray<{
                  favoritedColors?: Reference[];
                }> =
                  readField("favoritedColors", makeReference("ROOT_QUERY")) ??
                  [];
                return favoritedColors.some((colorRef) => {
                  return hex === readField("hex", colorRef);
                });
              },
            },
          },
        },
      },
    }),

    link: new HttpLink({ uri: "http://localhost:4000" }),
    localState: new LocalState(),

    devtools: {
      enabled: true,
      name,
    },

    incrementalHandler: new Defer20220824Handler(),
  });
}

export default App;
