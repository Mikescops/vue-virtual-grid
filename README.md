# Vue Virtual Grid

_Virtual Scrolling Grid made for VueJS based on CSS grids._

[NPM Package](https://www.npmjs.com/package/vue-virtual-grid) | [Demo Website](https://vue-virtual-grid.netlify.app/)

---

-   Render any Vue Component (images, iframes, content) of a known width/height inside.
-   Variable height items in the same row.
-   Variable width items (based on columns).
-   Rendering is done with virtual scrolling (aka windowing).
-   Supports infinite scroll!

---

## Install

```bash
npm install --save vue-virtual-grid
```

### Usage

Import VirtualGrid from the package:

```ts
import VirtualGrid from 'vue-virtual-grid';
```

Register it as on of your components:

```js
components: {
    VirtualGrid,
},
```

In your template you can add:

```html
<VirtualGrid :items="yourDataSet" :updateFunction="yourGetDataFunction" />
```

The `items` property is requeried and should be an array of the following object:

```js
{
    id: string, // binding id (must be unique)
    injected?: string, // custom param, pass an object with what you want inside (optional)
    height: number, // original height of the item
    width?: number, // original width of the item (optional: if not set, height will not be adjusted by getItemRatioHeight)
    columnSpan: number, // how many columns will use your item (put 0 if you want the full width)
    newRow?: boolean, // if the item should appear on the next row (optional)
    renderComponent: Component // A VueJS component (custom template of your choice) to render the item (passed as prop `item`)
}
```

You can update the `items` property at any time (and thus decide what can of storage you want to use) and the grid layout will be recomputed.

The `VirtualGrid` also takes multiple custom optional functions/variables as properties

-   **updateFunction**:
    An async function that will populate the grid, constructor is the following `updateFunction() => Promise<boolean>`. For synchronous function just return immediately with `Promise.resolve(boolean)` for instance.
-   **getGridGap**:
    A function that will define the gap between elements of the grid, constructor is the following `getGridGap(elementWidth: number, windowHeight: number) => number`.
-   **getColumnCount**:
    A function that set the width of columns in the grid, constructor is the following `getColumnCount(elementWidth: number) => number;`.
-   **getWindowMargin**:
    A function that set the margin size used for windowing (virtualization), constructor is the following `getWindowMargin(windowHeight: number) => number;`.
-   **getItemRatioHeight**:
    A function that provides a way to adjust the item height by computing the initial height/width ratio and the column width (by default it preserves ratio), constructor is the following `getItemRatioHeight(height: number, width: number, columnWidth: number) => number;`.
-   **updateTriggerMargin**:
    A number of pixels to the bottom of the page that will trigger the `updateFunction`.

Properties are provided with default functions that you can use or get inspired from in `src/utils.ts`.

The function `updateFunction` should update the list of items that will be rendered (each item should look like the `Item` object presented before) and return (with a Promise) a boolean that signify that the last batch was loaded (bottom reached) or not.

The property `injected` does not impact the computation, it is here to pass custom data to the final component.

With default `getItemRatioHeight`, in the returned object to your `renderComponent` the height property will be recomputed depending on the column size and the width will be set to the column width multiplied by the column span of the item. Note that it will always keep the original ratio.

**Important note:** the component that will render the item should respect the returned height otherwise there will be a difference between computation and rendering (in other words, you will see glitches).

Last but not least, the `resetGrid()` method is exposed to parent in case you want to clear the grid :)

### Typescript support

If you're using Typescript you can import typing for `Item` and provide custom typing for injected data:

```ts
import { Item } from 'vue-virtual-grid';

interface Image {
    alt: string;
    url: string;
}

const item: Item<Image>;
```

You can also import the typing for utils methods with `VirtualGridInterface`.

### Live example

If you want a live example, you can take a look at the demo (link at the top) and check the corresponding code in `example/`.

## Contribute

Anyone is welcome to contribute (this project is not perfect obviously).

### Install current dependencies

```bash
npm ci
```

### Build and try the example

```bash
npm run serve:example
```

### Compiles lib for production

```bash
npm run build
```

### Lints and fixes files

```bash
npm run lint
```

## Inspiration

This is based on React work here: https://github.com/jamiebuilds/react-gridlist

**Kudos to Jamie!**

## Maintainer

| [![twitter/mikescops](https://avatars0.githubusercontent.com/u/4266283?s=100&v=4)](https://pixelswap.fr 'Personal Website') |
| --------------------------------------------------------------------------------------------------------------------------- |
| [Corentin Mors](https://pixelswap.fr/)                                                                                      |
