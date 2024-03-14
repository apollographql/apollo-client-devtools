import { NgModule, Injectable } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { ApolloModule, APOLLO_OPTIONS } from "apollo-angular";

import { HttpLink, HttpOptions } from "@apollo/client/link/http";
import { ApolloClientOptions, InMemoryCache } from "@apollo/client/core";

const uri = "http://localhost:4000/";

@Injectable({
  providedIn: "root",
})
class InjectableHttpLink {
  constructor() {}

  public create(options: HttpOptions): HttpLink {
    return new HttpLink(options);
  }
}

function createApollo(httpLink: InjectableHttpLink): ApolloClientOptions<any> {
  return {
    link: httpLink.create({ uri }),
    cache: new InMemoryCache(),
  };
}

@NgModule({
  exports: [ApolloModule, HttpClientModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [InjectableHttpLink],
    },
  ],
})
export class GraphQLModule {}
