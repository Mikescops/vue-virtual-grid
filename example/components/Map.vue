<template>
    <div :style="{ height: item.height + 'px' }">
        <iframe
            width="100%"
            :height="item.height"
            frameborder="0"
            scrolling="no"
            marginheight="0"
            marginwidth="0"
            :src="`https://www.openstreetmap.org/export/embed.html?bbox=${item.injected.coordinates}&amp;layer=mapnik`"
        ></iframe>
    </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import { Item } from '../../src/types';

export interface Map {
    coordinates: string;
}

@Component
export default class MapComponent extends Vue {
    @Prop() item: Item<Map>;
}
</script>

<style scoped>
</style>
