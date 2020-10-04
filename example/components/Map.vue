<template>
    <div :style="{ height: item.height + 'px' }">
        <iframe
            width="100%"
            :height="item.height"
            frameborder="0"
            scrolling="no"
            marginheight="0"
            marginwidth="0"
            :src="'https://www.openstreetmap.org/export/embed.html?bbox=' + item.url + '&amp;layer=mapnik'"
            style="border: 1px solid black"
        ></iframe>
    </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import { Item } from '../../src/types';

@Component
export default class MapComponent extends Vue {
    @Prop() private item: Item;
}
</script>

<style scoped>
</style>
