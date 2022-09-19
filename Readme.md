# Module synchronizer

A zero dependency tool to load modules asynchronously and in the meantime capture all of the calls to that module, passing them in order of the execution to the asynchronously loaded module.

## Installing

    yarn add module-synchronizer
    # or
    npm install module-synchronizer --save

## Usage

```typescript
import { ModuleSynchronizer } from "module-synchronizer";

// Create a new synchronizer, with the same type as the library
const synchronizer = new ModuleSynchronizer(import("logging-library"));

// The module will be loaded asynchronously, but all the calls to it will be captured and executed in order
synchronizer.log("logging test"); // returns a promise - could be discarded if the result of the promise is not needed
synchronizer.info("info test");
synchronizer.debug("debug test");

// Once the module is loaded, the synchronizer will be replaced with the actual module
synchronizer.log("logging test"); // runs the logger synchronously
```

## TypeScript

This project was written entirely in TypeScript, so you can make use of the provided type definitions!

## Contributing

Feel free to open issues or pull requests on GitHub. Do not add unnecessary production dependencies, as we want
to keep the dependency tree as small as possible

After cloning the project, simply run `yarn install`, then `yarn build` to compile or `yarn test` to run tests

```

```
