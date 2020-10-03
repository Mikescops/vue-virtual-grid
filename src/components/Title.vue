<template>
    <div class="title" :style="{ height: `${item.height}px` }">
        <h2>{{ item.title }}</h2>
    </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import { Item } from '../App.vue';

@Component
export default class HelloWorld extends Vue {
    @Prop() private item: Item;
}

</script>

<style scoped>
.title {
    display: inline-grid;
    align-items: center;
    width: 100%;
    color: #fff;
    background: #666;

    border-radius: 4px;
}
</style>
