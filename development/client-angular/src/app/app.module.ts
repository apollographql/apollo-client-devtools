import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { ProductListComponent } from "./product-list/product-list.component";

import { GraphQLModule } from "./graphql.module";

@NgModule({
  imports: [BrowserModule, GraphQLModule],
  declarations: [AppComponent, ProductListComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
