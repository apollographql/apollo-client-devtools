import { Component, OnDestroy, OnInit } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Product, Query } from "../types";

const DEFERRED_QUERY = gql`
  query TestQuery {
    allProducts {
      ...DimensionsAndVariation @defer
      sku
      id
    }
  }
  fragment DimensionsAndVariation on Product {
    dimensions {
      size
    }
    variation {
      id
      name
    }
  }
`;

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
})
export class ProductListComponent implements OnInit {
  products: Observable<Product[]>;
  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.products = this.apollo
      .watchQuery<Query>({
        query: DEFERRED_QUERY,
      })
      .valueChanges.pipe(map((result) => result.data.allProducts));
  }
}
