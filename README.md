## To run the project locally

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

2. Run the `generate-colors` script to preload the [NTCJS color library](https://www.npmjs.com/package/ntcjs) & generate the ntc hex-color map:

   ```bash
   npm run generate-colors
   #or
   yarn generate-colors
   ```

3. run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see assignment

## Design Choices

- I choose the NextJs framework to handle the boilerplates for common setup such as eslint, pre-configured project layouts (app, page, public and style configs), built in typescript support with config setup. As well as immediate server run and hot module replacement (HMR).

[x] Outlined approach to `reduce number of API calls and improve performance`:

1. Used `useEffect` hook to watch when saturation or lightness updates via a user input change
2. For an input change, iterate through each hue value (0-360) to create a hsl combination for the saturation/light pair
3. Convert each hsl combination to a hex using the `hslToHex` util
4. Map the hex to the closest color name using the preloaded static [NTCJS color map](https://www.npmjs.com/package/ntcjs) in `color-name-map.json` -OR- the `apiCache` (For this assignment I used a Map() to handle our apiCache and hydrate it on every new component instantiation with `localStorage` data which is persisted across user sessions). This allows us to avoid the API call if the hex color name is available in our static list or our apiCache. _(In a fullstack application this cache layer can exist serverside for scalability (e.g `Redis`). As well as built in client-cache mechanisms from query frameworks like `react-query` or `apollo client` which are more secure, scalable and robust cache storage)_
5. If the hex color name is not in the `NTC colors map` or the `apiCache`, then fetch the API using the hex string (and update cache)

[x] `Optimized rendering`:

- Only unique colors are rendered using a `colorNameSet` which enforces that the `colorSwatches` component state is only updated if the color name has not already been added to the set.
- Support `incremental rendering` by updating the `colorSwatches` component state each time a new color is added (instead of waiting for all colors to finish loading). Since react listens to state changes, the UI will update the swatches grid incrementally with a new color when we update the `colorSwatches` component state.

[x] `UX for S and L selection`:

- I used a `range input` for quick and non granular controls that are fast and touch friendly on mobile. On mobile, it maybe easier to `drag` than type.
- I also used a `number input` for easy granular control, and step-by-step adjustments using the `arrow key` when the user needs to find exact values.

[x] `Feedback and Loading`

- I used a `loading` state to signal to the user when server look ups are occuring using a dynamic header. A header rendering `Looking Up Colors...` to inform user when server calls are still being made, and a `Swatches Generated!` header to inform server calls were complete.
- I made a reuseable `useToast` hook to notify of API fetch or cache errors. Custom toasts allows JS execution to not be blocked & continue to run while still giving the user feedback. It also doesn't interrupt the UI interaction if other API calls are successful and allows custom styling as well as non-blocking UX (e.g. successful API calls for swatches could still update the UI swatches grid).

[x] `Mobile, Ipad, Desktop` view is supported. I used a column layout for the swatches and input sections on mobile devices.
