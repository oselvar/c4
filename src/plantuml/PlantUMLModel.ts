import { C4Object } from "../c4ModelZ";

export type C4RenderedRelationship = {
  from: C4Object;
  to: C4Object;
  name: string;
};

export type C4PumlModel = {
  root: C4Object;
  internal: C4Object[];
  externals: C4Object[];
  relationships: C4RenderedRelationship[];
};
