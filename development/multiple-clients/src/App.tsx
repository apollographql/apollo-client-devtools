import { Suspense, useState } from "react";
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  makeVar,
  useReactiveVar,
} from "@apollo/client";
import { Launches } from "./components/Launches";

function createClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: "https://spacex-production.up.railway.app/" }),
  });
}

const defaultClient = createClient();
const clientsVar = makeVar([defaultClient]);

function App() {
  const clients = [...useReactiveVar(clientsVar)];
  const [selectedClientIndex, setSelectedClientIndex] = useState(0);

  return (
    <ApolloProvider client={clients[selectedClientIndex]}>
      <select
        value={0}
        onChange={(e) => setSelectedClientIndex(Number(e.target.value))}
      >
        {clients.map((_, index) => (
          <option key={index} value={index}>
            Client {index}
          </option>
        ))}
      </select>
      <div>
        <button onClick={() => clientsVar([...clientsVar(), createClient()])}>
          Create client
        </button>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Launches />
      </Suspense>
    </ApolloProvider>
  );
}

export default App;
