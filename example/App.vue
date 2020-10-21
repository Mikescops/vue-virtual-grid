<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png" /> <br />
        <a class="button" v-on:click="resetList()">Reset Component</a>
        <VirtualGrid
            :v-if="loaded"
            ref="virtualgrid"
            :items="list"
            :updateFunction="pullData"
            :debug="true"
            :loader="loaderComponent"
            @event-test="alertTest"
        />
    </div>
</template>

<script lang="ts">
import { Component, Provide, ProvideReactive, Vue } from 'vue-property-decorator';
import VirtualGrid from '../src/VirtualGrid.vue';
import { Item, VirtualGridInterface } from '../src/types';
import Loader from './components/Loader.vue';

// Custom components to render
import * as ImageComponent from './components/Image.vue';
import * as TitleComponent from './components/Title.vue';
import * as MapComponent from './components/Map.vue';

type CustomDataTypes = ImageComponent.Image | TitleComponent.Title | MapComponent.Map;

@Component({
    components: {
        VirtualGrid,
    },
})
export default class App extends Vue {
    @ProvideReactive() loaded: boolean = false;
    @Provide() batchSize: number = 50;
    @Provide() loaderComponent: Vue.Component = Loader;

    @ProvideReactive() list: Item<CustomDataTypes>[] = [];
    @ProvideReactive() offset: number = 0;

    mounted() {
        this.initializeList();
    }

    initializeList() {
        this.pullData()
            .catch((error) => {
                if (error) {
                    console.error('Failed to load initial data', error);
                }
            })
            .then(() => {
                this.loaded = true;
            });
    }

    random(low: number, high: number) {
        return Math.floor(Math.random() * high) + low;
    }

    pullData(): Promise<boolean> {
        // This is to try when we reach end of infinite scroll (only 5 loads)
        if (this.offset > 5) {
            return Promise.resolve(true);
        }

        // Add a title at each section
        const sectionTitle = {
            id: `title-${this.offset}`,
            injected: {
                title: `Welcome to section ${this.offset}`,
            },
            width: 500,
            height: 250,
            columnSpan: 2,
            newRow: true,
            renderComponent: TitleComponent.default,
        };

        // Add a map sometimes (to test iframes)
        const map = {
            id: `map-${this.offset}`,
            injected: {
                coordinates: '-11.18408203125%2C39.2832938689385%2C17.819824218750004%2C52.77618568896171',
            },
            height: 300,
            columnSpan: 0,
            newRow: true,
            renderComponent: MapComponent.default,
        };
        const sectionMap = this.offset === 0 ? [map] : [];

        // Populate random images (for the demo)
        const randomImages = Array.from({ length: this.batchSize }, (_, index) => {
            const randSize = this.random(1, 2); // just to randomized which images can be big or not

            const width = 250 * randSize;
            const height = 250; // this can work with random height also
            const id = index + this.offset * this.batchSize;
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

        this.list = [...this.list, ...[sectionTitle, ...randomImages, ...sectionMap]];

        this.offset += 1;

        // Wait between each response just to see the loader
        return new Promise((resolve) => setTimeout(() => resolve(false), 2000));
    }

    resetList() {
        this.loaded = false;
        this.list = [];
        this.offset = 0;
        const grid = this.$refs.virtualgrid as VirtualGridInterface;
        grid.resetGrid();
        this.initializeList();
    }

    alertTest() {
        alert('This is an event passed with listeners');
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
    margin: 40px 0;
}

.button {
    background: #41b883;
    color: #fff;
    padding: 10px;
    border-radius: 3px;
    cursor: pointer;
    margin: 5px;
}
</style>
