<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png" />
        <GridList :updateFunction="pullData" :batchSize="batchSize" />
    </div>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator';
import * as GridList from './components/GridList.vue';

// Custom components to render
import ImageComponent from './components/Image.vue';
import TitleComponent from './components/Title.vue';
import MapComponent from './components/Map.vue';

@Component({
    components: {
        GridList: GridList.default
    }
})
export default class App extends Vue {
    @Provide() private batchSize: number = 50;

    private random(low: number, high: number) {
        return Math.floor(Math.random() * high) + low;
    }

    private pullData(params: { batchSize: number; offset: number }): GridList.Item[] {
        // This is to try when we reach end of infinite scroll (only 5 loads)
        if (params.offset > 5) {
            return [];
        }

        // Add a title at each section
        const sectionTitle = {
            id: `title-${params.offset}`,
            title: `Welcome to section ${params.offset}`,
            url: '',
            width: 500,
            height: 250,
            columnSpan: 2,
            newRow: true,
            renderComponent: TitleComponent
        };

        // Add a map sometimes (to test iframes)
        const sectionMap = this.random(1, 4) === 1 ? [{
            id: `map-${params.offset}`,
            title: '',
            url: '-11.18408203125%2C39.2832938689385%2C17.819824218750004%2C52.77618568896171',
            width: 1000,
            height: 200,
            columnSpan: 0,
            newRow: true,
            renderComponent: MapComponent
        }] : [];

        // Populate random images (for the demo)
        const randomImages = Array.from({ length: params.batchSize }, (_, index) => {
            const randSize = this.random(1, 2); // just to randomized which images can be big or not

            const width = 250 * randSize;
            const height = 250; // this can work with random height also
            const id = index + (params.offset * params.batchSize);
            return {
                id: `img-${id}`,
                title: `Image ${id}`,
                url: `https://picsum.photos/id/${id + 1}/${width}/${height}.jpg`,
                width,
                height,
                columnSpan: randSize,
                renderComponent: ImageComponent
            };
        });

        return [sectionTitle, ...randomImages, ...sectionMap];
    }
}
</script>

<style scoped>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
