# Vue Virtual Grid

*Virtual Scrolling Grid made for VueJS based on CSS grids.*

[NPM Package](https://www.npmjs.com/package/vue-virtual-grid) | [Demo Website](https://vue-virtual-grid.netlify.app/)

---

- Render any Vue Component (images, iframes, content) of a known width/height inside.
- Variable height items in the same row.
- Variable width items (based on columns).
- Rendering is done with virtual scrolling (aka windowing).

---

## Install

```
npm install --save vue-virtual-grid
```

### Usage

Import VirtualGrid from the package:
```
import VirtualGrid from 'vue-virtual-grid';
```

Register it as on of your components:
```
components: {
    VirtualGrid,
},
```

In your template you can add:
```
<VirtualGrid :updateFunction="yourGetDataFunction" />
```

The VirtualGrid takes `updateFunction` as property.
A function that will populate the grid, constructor is the following `updateFunction(params: { offset: number }) => VirtualGrid.Item[]`.
The offset will be incremented (+1) each time the function is called.

The function should return a list of items that will be rendered, each item should look like this object:
```
{
    id: string, // binding id
    title: string, // custom param1
    url: string, // custom param2
    width: number, // original width of the item
    height: number, // original height of the item
    columnSpan: number, // how many columns will use your item (put 0 if you want the full width)
    newRow?: boolean, // if the item should appear on the next row (optional)
    renderComponent: Component // A VueJS component (custom template of your choice) to render the item (passed as prop `item`)
}
```
The properties `title` and `url` does not impact the computation, they are here to pass custom data to the final component.

In the returned object to your `renderComponent` the height and width properties will be recomputed depending on the column size. It will always keep the original ratio.

### Typescript support

If you're using typescript you can import typing for Item:
```
import { Item } from 'vue-virtual-grid';
```

### Live example

If you want a live example, you can take a look at the demo and check the corresponding code in `example/`.

## Contribute

Anyone is welcome to contribute (this project is not perfect obviously).

### Install current dependencies

```
npm ci
```

### Build and try the example

```
npm run serve:example
```

### Compiles lib for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

## Inspiration

This is based on React work here: https://github.com/jamiebuilds/react-gridlist

**Kudos to Jamie!**

## Maintainer

| [![twitter/mikescops](https://avatars0.githubusercontent.com/u/4266283?s=100&v=4)](https://pixelswap.fr 'Personal Website') |
| --------------------------------------------------------------------------------------------------------------------------- |
| [Corentin Mors](https://pixelswap.fr/)                                                                                      |
