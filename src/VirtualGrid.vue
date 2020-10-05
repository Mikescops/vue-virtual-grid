<script lang="ts">
import { Prop, Component, Vue, ProvideReactive } from 'vue-property-decorator';
import { getGridGapDefault, getColumnCountDefault, getWindowMarginDefault, getItemRatioHeightDefault } from './utils';
import { Item } from './types';

interface ContainerData {
    windowSize: ElementSize;
    windowScroll: ElementScroll;
    elementWindowOffset: number;
    elementSize: ElementSize;
}

interface ElementSize {
    width: number;
    height: number;
}

interface ElementScroll {
    x: number;
    y: number;
}

interface ConfigData<P> {
    windowMargin: number;
    gridGap: number;
    columnCount: number;
    entries: Item<P>[];
}

interface Cell<P> extends Item<P> {
    columnNumber: number;
    rowNumber: number;
    offset: number;
}

interface LayoutData<P> {
    totalHeight: number;
    cells: Cell<P>[];
}

interface RenderData<P> {
    cellsToRender: Cell<P>[];
    firstRenderedRowNumber: number;
    firstRenderedRowOffset: number;
}

@Component
export default class VirtualGrid<P> extends Vue {
    @Prop({ default: () => (): Item<unknown>[] => [] }) updateFunction: (params: {
        offset: number;
    }) => Promise<Item<P>[]>;
    @Prop({ default: () => getGridGapDefault }) getGridGap: (elementWidth: number, windowHeight: number) => number;
    @Prop({ default: () => getColumnCountDefault }) getColumnCount: (elementWidth: number) => number;
    @Prop({ default: () => getWindowMarginDefault }) getWindowMargin: (windowHeight: number) => number;
    @Prop({ default: () => getItemRatioHeightDefault }) getItemRatioHeight: (
        height: number,
        width: number,
        columnWidth: number
    ) => number;

    @ProvideReactive() updateLock: boolean = false;

    @ProvideReactive() items: Item<P>[] = [];

    @ProvideReactive() offset: number = 0;
    @ProvideReactive() bottomReached: boolean = false;

    @ProvideReactive() ref: Element = null;

    @ProvideReactive() containerData: ContainerData = {
        windowSize: { height: 0, width: 0 },
        windowScroll: { x: 0, y: 0 },
        elementWindowOffset: 0,
        elementSize: { height: 0, width: 0 },
    };

    @ProvideReactive() configData: ConfigData<P> = {
        windowMargin: 0,
        gridGap: 0,
        columnCount: 1,
        entries: [],
    };

    @ProvideReactive() layoutData: LayoutData<P> = {
        totalHeight: 0,
        cells: [],
    };

    @ProvideReactive() renderData: RenderData<P> = {
        cellsToRender: [],
        firstRenderedRowNumber: 0,
        firstRenderedRowOffset: 0,
    };

    created() {
        this.loadMoreData()
            .catch((error) => {
                if (error) {
                    console.error('Failed to load initial data', error);
                }
            })
            .then(() => {
                this.ref = this.$refs.virtualGrid as Element;
                this.computeContainerData();
                this.computeConfigData(this.containerData, this.items);
                this.computeLayoutData(this.configData);
                this.computeRenderData(this.configData, this.containerData, this.layoutData);

                window.addEventListener('resize', this.resize);
                window.addEventListener('scroll', this.scroll);
            });
    }

    beforeDestroy() {
        window.removeEventListener('resize', this.resize);
        window.removeEventListener('scroll', this.scroll);
    }

    resize() {
        this.computeContainerData();
        this.computeConfigData(this.containerData, this.items);
        this.computeLayoutData(this.configData);
        this.computeRenderData(this.configData, this.containerData, this.layoutData);
    }

    scroll() {
        this.computeContainerData();
        this.computeInfiniteScroll(this.containerData)
            .catch((error) => {
                if (error) {
                    console.error('Fail to load next data batch', error);
                }
            })
            .then(() => {
                this.computeConfigData(this.containerData, this.items);
                this.computeLayoutData(this.configData);
                this.computeRenderData(this.configData, this.containerData, this.layoutData);
            });
    }

    async loadMoreData() {
        if (this.updateLock) {
            return Promise.resolve();
        }
        this.updateLock = true;
        const newItems = await this.updateFunction({ offset: this.offset });
        console.log(newItems);
        if (newItems.length === 0) {
            console.log('Bottom reached');
            this.bottomReached = true;
            return Promise.resolve();
        }

        this.items = [...this.items, ...newItems];
        this.offset += 1;
        this.updateLock = false;
        return Promise.resolve();
    }

    computeInfiniteScroll(containerData: ContainerData) {
        const windowTop = containerData.windowScroll.y;
        const windowBottom = windowTop + containerData.windowSize.height;

        if (
            !this.bottomReached &&
            windowBottom > containerData.elementWindowOffset + containerData.elementSize.height - 500
        ) {
            console.log('Loading next batch');
            return this.loadMoreData();
        }
        return Promise.resolve();
    }

    computeContainerData() {
        const windowSize = this.getWindowSize();
        const windowScroll = this.getWindowScroll();
        const elementWindowOffset = this.getElementOffset(this.ref);
        const elementSize = this.getElementSize(this.ref);

        this.containerData = { windowSize, windowScroll, elementWindowOffset, elementSize };
    }

    computeConfigData(containerData: ContainerData, items: Item<P>[]) {
        const elementWidth = containerData.elementSize ? containerData.elementSize.width : null;

        const windowMargin = this.getWindowMargin(containerData.windowSize.height);

        const gridGap = this.getGridGap(elementWidth, containerData.windowSize.height);

        const columnCount = this.getColumnCount(elementWidth);

        const columnWidth = this.getColumnWidth(columnCount, gridGap, elementWidth);

        const entries = items.map((item) => {
            // if the column span is 0 or negative we assume it is full width
            if (item.columnSpan < 1) {
                item.columnSpan = columnCount;
            }

            const imageWidth = columnWidth * item.columnSpan + gridGap * (item.columnSpan - 1);
            return {
                ...item,
                height: this.getItemRatioHeight(item.height, item.width, imageWidth),
                width: imageWidth,
            };
        });

        this.configData = {
            windowMargin,
            gridGap,
            columnCount,
            entries,
        };
    }

    computeLayoutData(configData: ConfigData<P>) {
        if (configData === null) {
            return;
        }

        let currentRowNumber = 1;
        let prevRowsTotalHeight = 0;
        let currentRowMaxHeight = 0;

        let columnShift = 0;

        const cells: Cell<P>[] = configData.entries.map((entry, index) => {
            const distanceToRowStart = (index + columnShift) % configData.columnCount;
            if (entry.newRow && distanceToRowStart !== 0) {
                columnShift += configData.columnCount - distanceToRowStart;
            }

            const shiftedIndex = index + columnShift;
            const columnNumber = (shiftedIndex % configData.columnCount) + 1;
            const rowNumber = Math.floor(shiftedIndex / configData.columnCount) + 1;

            // here we check that an image is not going out of the grid, if yes we resize it
            if (columnNumber + entry.columnSpan > configData.columnCount + 1) {
                const overlapNumber = columnNumber + entry.columnSpan - configData.columnCount - 1;
                const overlapRatio = overlapNumber / entry.columnSpan;
                entry.height = entry.height * (1 - overlapRatio);

                entry.columnSpan -= overlapNumber;
            }

            // we need to count the shift created by multiple column objects
            if (entry.columnSpan > 1) {
                columnShift += entry.columnSpan - 1;
            }

            if (rowNumber !== currentRowNumber) {
                currentRowNumber = rowNumber;
                prevRowsTotalHeight += currentRowMaxHeight + configData.gridGap;
                currentRowMaxHeight = 0;
            }

            const offset = prevRowsTotalHeight;
            const height = Math.round(entry.height);

            currentRowMaxHeight = Math.max(currentRowMaxHeight, height);

            return { ...entry, columnNumber, rowNumber, offset, height };
        });

        const totalHeight = prevRowsTotalHeight + currentRowMaxHeight;

        this.layoutData = { cells, totalHeight };
    }

    computeRenderData(configData: ConfigData<P>, containerData: ContainerData, layoutData: LayoutData<P>) {
        if (layoutData === null || configData === null) {
            return;
        }
        const cellsToRender: Cell<P>[] = [];
        let firstRenderedRowNumber: null | number = null;
        let firstRenderedRowOffset: null | number = null;

        if (containerData.elementWindowOffset !== null) {
            const elementWindowOffset = containerData.elementWindowOffset;

            for (const cell of layoutData.cells) {
                const cellTop = elementWindowOffset + cell.offset;
                const cellBottom = cellTop + cell.height;

                const windowTop = containerData.windowScroll.y;
                const windowBottom = windowTop + containerData.windowSize.height;

                const renderTop = windowTop - configData.windowMargin;
                const renderBottom = windowBottom + configData.windowMargin;

                if (cellTop > renderBottom) {
                    continue;
                }
                if (cellBottom < renderTop) {
                    continue;
                }

                if (firstRenderedRowNumber === null) {
                    firstRenderedRowNumber = cell.rowNumber;
                }

                if (cell.rowNumber === firstRenderedRowNumber) {
                    firstRenderedRowOffset = firstRenderedRowOffset
                        ? Math.min(firstRenderedRowOffset, cell.offset)
                        : cell.offset;
                }

                cellsToRender.push(cell);
            }
        }

        this.renderData = { cellsToRender, firstRenderedRowNumber, firstRenderedRowOffset };
    }

    /** Grid utils */

    getColumnWidth(columnCount: number | null, gridGap: number | null, elementWidth: number | null) {
        if (columnCount === null || gridGap === null || elementWidth === null) {
            return null;
        }

        const totalGapSpace = (columnCount - 1) * gridGap;
        const columnWidth = Math.round((elementWidth - totalGapSpace) / columnCount);

        return columnWidth;
    }

    getGridRowStart(cell: Cell<P>, renderData: RenderData<P> | null) {
        if (renderData === null) {
            return undefined;
        }

        const offset = renderData.firstRenderedRowNumber !== null ? renderData.firstRenderedRowNumber - 1 : 0;
        const gridRowStart = cell.rowNumber - offset;

        return `${gridRowStart}`;
    }

    /** UTILS */

    isSameElementSize(a: ElementSize, b: ElementSize) {
        return a.width === b.width && a.height === b.height;
    }

    getWindowSize(): ElementSize {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }

    getElementSize(element: Element): ElementSize {
        const rect = element.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
        };
    }

    isSameElementScroll(a: ElementScroll, b: ElementScroll) {
        return a.x === b.x && a.y === b.y;
    }

    getWindowScroll(): ElementScroll {
        return {
            x: window.scrollX,
            y: window.scrollY,
        };
    }

    getElementOffset(element: Element) {
        return window.scrollY + element.getBoundingClientRect().top;
    }
}
</script>


<template>
    <div
        ref="virtualGrid"
        :style="{
            boxSizing: 'border-box',
            height: `${layoutData.totalHeight}px`,
            paddingTop:
                renderData !== null && renderData.firstRenderedRowOffset !== null
                    ? `${renderData.firstRenderedRowOffset}px`
                    : '0px',
        }"
    >
        <div
            class="grid"
            :style="{
                'grid-template-columns': `repeat(${configData.columnCount}, 1fr)`,
                'gap': `${configData.gridGap}px`,
            }"
        >
            <div
                v-for="item in renderData.cellsToRender"
                :key="item.id"
                :style="{
                    'height': item.height,
                    'grid-column-start': item.columnNumber,
                    'grid-column-end': item.columnNumber + item.columnSpan,
                    'grid-row-start': getGridRowStart(item, renderData),
                }"
            >
                <component :is="item.renderComponent" :item="item"></component>
            </div>
        </div>
    </div>
</template>

<style scoped>
.grid {
    display: grid;
    align-items: center;
}
</style>
