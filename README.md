### getting started
```
git clone https://github.com/estebanabaroa/plebbit-js-benchmark.git
npm install
npm run webpack
npm start
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

1. `npm run webpack` bundles `./benchmark` folder with all the benchmark scripts `resolve-addresses|fetch-ipns|gateway-fetch-ipns`
2. `npm start` launches `node start`
3. `node start` launches:
  - `lib/server` which is needed to communicate with the browser benchmarks
  - it reads `./benchmark-options` and iterates over all the benchmarks to do
  - for each benchmark to do, it launches either node or karma (browser) to execute it in an isolated environment (no caching)
  - it launches `npm run report` to print the last report (saved to `./report.json`)
