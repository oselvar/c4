import { C4Object } from "../C4Model";

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
