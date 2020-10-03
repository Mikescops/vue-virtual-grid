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
import Image from './components/Image.vue';
import Title from './components/Title.vue';

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

        const sectionTitle = {
            id: `title-${params.offset}`,
            title: `Welcome to section ${params.offset}`,
            url: '',
            width: 500,
            height: 250,
            columnSpan: 2,
            newRow: true,
            renderComponent: Title
        };

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
                renderComponent: Image
            };
        });

        return [sectionTitle, ...randomImages];
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
