<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png" />
        <GridList :updateFunction="pullData" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GridList from './components/GridList.vue';

export interface Item {
    id: number;
    url: string;
    width: number;
    height: number;
    isVisible: boolean;
    columnSpan: number;
}

@Component({
    components: {
        GridList
    }
})
export default class App extends Vue {
    private random(low: number, high: number) {
        return Math.floor(Math.random() * high) + low;
    }

    private pullData(params: { batchSize: number; offset: number }): Item[] {
        // This is to try when we reach end of ifinite scroll
        if (params.offset > 100) {
            return [];
        }

        // Populate random images
        return Array.from({ length: params.batchSize }, (_, index) => {
            const randSize = this.random(1, 2); // just to randomized which images can be big or not

            const width = 250 * randSize;
            const height = 250; // this can work with random height also
            const id = index + params.offset;
            return {
                id,
                url: `https://picsum.photos/id/${id + 1}/${width}/${height}.jpg`,
                width,
                height,
                isVisible: false,
                columnSpan: randSize
            };
        });
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
</style>
