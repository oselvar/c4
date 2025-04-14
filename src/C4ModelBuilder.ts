import { C4Model } from "./C4Model";

export type C4ObjectParams = {
  parentId?: string;
  tags?: readonly string[];
};

export type C4SoftwareSystemParams = C4ObjectParams;
export type C4GroupParams = C4ObjectParams;
export type C4PersonParams = C4ObjectParams;

export type C4ContainerParams = C4ObjectParams & {
  softwareSystem?: string;
};

export type C4ComponentParams = C4ObjectParams & {
  container?: string;
};

export interface C4ModelBuilder {
  hasObject(name: string): boolean;
  addPerson(name: string, params?: C4PersonParams): string;
  addSoftwareSystem(name: string, params?: C4SoftwareSystemParams): string;
  addGroup(name: string, params?: C4GroupParams): string;
  addContainer(name: string, params: C4ContainerParams): string;
  addComponent(name: string, params: C4ComponentParams): string;
  addDependency(
    callerName: string,
    calleeName: string,
    dependencyName: string,
  ): void;
  build(): C4Model;
}
