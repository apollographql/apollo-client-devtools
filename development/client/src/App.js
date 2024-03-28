import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  makeReference,
  useQuery,
} from "@apollo/client";
import ColorSchemeGenerator from "./ColorSchemeGenerator";
import Favorites from "./Favorites";
import ColorLookup from "./ColorLookup";
import { GET_SAVED_COLORS } from "./queries";
import "./App.css";

function App() {
  const [client, setClient] = useState(() => createClient());

  if (!client) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Client was terminated</h1>
        <button onClick={() => setClient(createClient())}>
          Recreate client
        </button>
      </div>
    );
  }

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Layout onChangeClient={(client) => setClient(client)} />
      </BrowserRouter>
    </ApolloProvider>
  );
}

function Layout({ onChangeClient }) {
  const { client } = useQuery(GET_SAVED_COLORS);

  return (
    <div className="App">
      <header style={{ display: "flex" }}>
        <Link to="/">
          <h1>Colors</h1>
        </Link>
        <nav style={{ flex: 1 }}>
          <Link to="/favorites">Favorites</Link>
          <Link to="/lookup">Lookup</Link>
        </nav>
        <div>
          <button
            onClick={() => {
              client.stop();
              onChangeClient(null);
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
  );
}

function createClient() {
  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Color: {
          keyFields: ["hex"],
          fields: {
            saved: {
              read(_, { readField }) {
                const hex = readField("hex");
                const favoritedColors = readField(
                  "favoritedColors",
                  makeReference("ROOT_QUERY")
                );
                return favoritedColors.some((colorRef) => {
                  return hex === readField("hex", colorRef);
                });
              },
            },
          },
        },
      },
    }),
    uri: "http://localhost:4000",
  });
}

export default App;
