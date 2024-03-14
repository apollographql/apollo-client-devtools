export type Product = {
  id: string;
  sku: string;
  dimensions?: { size: string };
  variation?: { id: string; name: string };
};

export type Query = {
  allProducts: Product[];
};
