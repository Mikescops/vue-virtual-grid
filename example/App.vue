<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png" />
        <VirtualGrid :updateFunction="pullData" />
    </div>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator';
import VirtualGrid from '../src/VirtualGrid.vue';
import { Item } from '../src/types';

// Custom components to render
import * as ImageComponent from './components/Image.vue';
import * as TitleComponent from './components/Title.vue';
import * as MapComponent from './components/Map.vue';

type CustomDataTypes = ImageComponent.Image | TitleComponent.Title | MapComponent.Map;

@Component({
    components: {
        VirtualGrid: VirtualGrid,
    },
})
export default class App extends Vue {
    @Provide() batchSize: number = 50;

    random(low: number, high: number) {
        return Math.floor(Math.random() * high) + low;
    }

    pullData(params: { offset: number }): Item<CustomDataTypes>[] {
        // This is to try when we reach end of infinite scroll (only 5 loads)
        if (params.offset > 5) {
            return [];
        }

        // Add a title at each section
        const sectionTitle = {
            id: `title-${params.offset}`,
            injected: {
                title: `Welcome to section ${params.offset}`,
            },
            width: 500,
            height: 250,
            columnSpan: 2,
            newRow: true,
            renderComponent: TitleComponent.default,
        };

        // Add a map sometimes (to test iframes)
        const map = {
            id: `map-${params.offset}`,
            injected: {
                coordinates: '-11.18408203125%2C39.2832938689385%2C17.819824218750004%2C52.77618568896171',
            },
            width: 1000,
            height: 200,
            columnSpan: 0,
            newRow: true,
            renderComponent: MapComponent.default,
        };
        const sectionMap = params.offset === 0 ? [map] : [];

        // Populate random images (for the demo)
        const randomImages = Array.from({ length: this.batchSize }, (_, index) => {
            const randSize = this.random(1, 2); // just to randomized which images can be big or not

            const width = 250 * randSize;
            const height = 250; // this can work with random height also
            const id = index + params.offset * this.batchSize;
            return {
                id: `img-${id}`,
                injected: {
                    alt: `Image ${id}`,
                    url: `https://picsum.photos/id/${id + 1}/${width}/${height}.jpg`,
                },
                width,
                height,
                columnSpan: randSize,
                renderComponent: ImageComponent.default,
            };
        });

        return [sectionTitle, ...randomImages, ...sectionMap];
    }
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

.grid {
    margin-bottom: 50px;
}
</style>
