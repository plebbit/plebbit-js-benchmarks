### getting started
```
git clone https://github.com/estebanabaroa/plebbit-js-benchmark.git
npm install
npm run webpack
npm start -- --runtime node --benchmark fetch-ipns
```

### running specific benchmarks

```
npm start -- --runtime node|chrome --benchmark resolve-addresses|fetch-ipns|gateway-fetch-ipns
```

### editing benchmark options (the plebbit options used, the subplebbit addresses, etc)

edit the file `./benchmark-options.js`. this is needed to do manual debugging with specific plebbit options.

### print reports

reports are saved to `./report.json`. running `npm start` overwrites the previous report.

```
npm run report
npm run report:inline
```

### webpack (for the browser benchmarks)
```
npm run webpack
npm run webpack:watch
```

### how it all works

- 1. `npm run webpack` bundles `./benchmark` folder with all the benchmark scripts `resolve-addresses|fetch-ipns|gateway-fetch-ipns`
- 2. `npm start` launches `node ./start` (with optional arguments `--runtime <runtime> --benchmark <benchmark>`)
- 3. `node ./start` launches:
  - 1. `./lib/server` which is needed to communicate with the browser benchmarks
  - 2. it reads `./benchmark-options.js` and iterates over all the benchmarks to do
  - 3. for each benchmark to do, it launches either node or karma (browser) to execute it in an isolated environment (i.e. no plebbit-js caching)
  - 4. it launches `npm run report` to print the last report (saved to `./report.json`)
