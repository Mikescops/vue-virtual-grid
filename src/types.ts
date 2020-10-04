import { Component } from 'vue';

export interface Item {
    id: string;
    title: string;
    url: string;
    width: number;
    height: number;
    columnSpan: number;
    newRow?: boolean;
    renderComponent: Component;
}
