import { Component } from 'vue';

export interface Item<P> {
    id: string;
    injected?: P;
    width: number;
    height: number;
    columnSpan: number;
    newRow?: boolean;
    renderComponent: Component;
}
