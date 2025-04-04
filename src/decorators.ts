/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { basename, extname } from "node:path";

import debug from "debug";
import ErrorStackParser from "error-stack-parser";

import {
  type C4ComponentParams,
  type C4ContainerParams,
  type C4SoftwareSystemParams,
} from "./C4ModelBuilder";
import { globalC4ModelBuilder } from "./globalC4ModelBuilder";

type Constructor<T = object> = new (...args: any[]) => T;

type System = Constructor;
type Container = Constructor;
type Component = Constructor;

const log = debug("@oselvar/c4");

export function C4SoftwareSystem<T extends System>(
  params?: C4SoftwareSystemParams,
) {
  return (system: T) => {
    globalC4ModelBuilder.addSoftwareSystem(system.name, { tags: params?.tags });
    return system;
  };
}

export function C4Container<T extends Container>({
  softwareSystem: system,
  tags,
}: C4ContainerParams) {
  return (container: T) => {
    globalC4ModelBuilder.addContainer(container.name, {
      softwareSystem: system,
      tags,
    });
    return container;
  };
}

export function C4Component<T extends Component>({
  container,
}: C4ComponentParams) {
  return (component: T) => {
    globalC4ModelBuilder.addComponent(component.name, { container });
    return component;
  };
}

export function C4Operation(): MethodDecorator {
  return function (...args: any[]): any {
    if (
      args.length === 2 &&
      args[1] &&
      typeof args[1] === "object" &&
      args[1].kind === "method"
    ) {
      // TC39 decorator
      const method = args[0];
      return c4OperationWrapper(method);
    } else {
      // Legacy experimental decorator
      const descriptor = args[2];
      if (descriptor && typeof descriptor.value === "function") {
        const originalMethod = descriptor.value;
        descriptor.value = c4OperationWrapper(originalMethod);
      }
      return descriptor;
    }
  };
}

function c4OperationWrapper(method: Function) {
  function wrapper(this: Function, ...args: unknown[]) {
    const calleeName = this.constructor.name;

    const stack = ErrorStackParser.parse(new Error());
    const callerClassNameCandidates = stack
      .filter((frame) => !frame.fileName?.match(/\/node_modules\//))
      .filter((frame) => !frame.fileName?.match(/^node:internal/))
      .flatMap(toClassNames);

    if (callerClassNameCandidates.length === 0) {
      log(
        `@oselvar/c4: Could not determine any caller class names from stack: ${JSON.stringify(stack)}`,
      );
    }

    const callerName = callerClassNameCandidates.find(
      (callerName) =>
        callerName !== calleeName && globalC4ModelBuilder.hasObject(callerName),
    );

    if (!callerName) {
      log(
        `@oselvar/c4:  No caller for ${calleeName}: ${JSON.stringify(stack, null, 2)}`,
      );
    }

    if (callerName) {
      const dependencyName = method.name;
      globalC4ModelBuilder.addDependency(
        callerName,
        calleeName,
        dependencyName,
      );
    }

    return method.apply(this, args);
  }
  return wrapper;
}

function toClassNames(frame: ErrorStackParser.StackFrame): readonly string[] {
  const classNames: string[] = [];
  const functioNameParts = frame.functionName?.split(".") || [];
  if (functioNameParts.length === 2) {
    classNames.push(functioNameParts[0]);
  }
  if (frame.fileName) {
    classNames.push(basename(frame.fileName, extname(frame.fileName)));
  }
  return classNames;
}
