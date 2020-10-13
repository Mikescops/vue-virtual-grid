import Vue, { Component } from 'vue';

export interface VirtualGridInterface extends Vue {
    resetGrid: () => void;
}

export interface Item<P> {
    id: string;
    injected?: P;
    height: number;
    width?: number;
    columnSpan: number;
    newRow?: boolean;
    renderComponent: Component;
}
