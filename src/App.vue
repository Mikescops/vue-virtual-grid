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
    id: string;
    title: string;
    url: string;
    width: number;
    height: number;
    columnSpan: number;
    newRow?: boolean;
    renderContent: (item: Item) => string;
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
        // This is to try when we reach end of ifinite scroll (only 5 loads)
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
            renderContent: (item: Item) => `<div class="title"
                style="height:${item.height}px;"
            >
                <h2>${item.title}</h2>
            </div>`
        };

        // Populate random images
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
                renderContent: (item: Item) => `<img
                        src="${item.url}"
                        title="${item.title}"
						height="${item.height}"
						class="image"
					/>`
            };
        });

        return [sectionTitle, ...randomImages];
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

/* This is the rendered classes (custom for the demo) */
.grid .title {
    display: inline-grid;
    align-items: center;
    width: 100%;
    color: #fff;
    background: #666;

    border-radius: 4px;
}

.grid .image {
    position: relative;
    width: 100%;
    height: auto;
    vertical-align: top;
    background: hsl(0, 0%, 98%);
    transition: 100ms ease;
    transition-property: transform box-shadow;
}
.grid .image:hover {
    z-index: 1;
    transform: scale(1.25);
    box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2),
        0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12);
}
</style>
