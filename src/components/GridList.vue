<script lang="ts">
import { Prop, Component, Vue, ProvideReactive, Provide } from 'vue-property-decorator';
import { Item } from '../App.vue';

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

interface ConfigData {
    windowMargin: number;
    gridGap: number;
    columnCount: number;
    entries: Item[];
}

interface Cell extends Item {
    columnNumber: number;
    rowNumber: number;
    offset: number;
}

interface LayoutData {
    totalHeight: number;
    cells: Cell[];
}

interface RenderData {
    cellsToRender: Cell[];
    firstRenderedRowNumber: number;
    firstRenderedRowOffset: number;
}

@Component
export default class HelloWorld extends Vue {
    @Prop() private updateFunction: (params: { batchSize: number; offset: number }) => Item[];

    @ProvideReactive() items: Item[] = [];
    @ProvideReactive() content: Item[] = [];

    @Provide() batchSize: number = 20;
    @ProvideReactive() offset: number = 0;
    @ProvideReactive() bottomReached: boolean = false;

    @ProvideReactive() ref: Element = null;

    @ProvideReactive() containerData: ContainerData = {
        windowSize: { height: 0, width: 0 },
        windowScroll: { x: 0, y: 0 },
        elementWindowOffset: 0,
        elementSize: { height: 0, width: 0 }
    }

    @ProvideReactive() configData: ConfigData = {
        windowMargin: 0,
        gridGap: 0,
        columnCount: 1,
        entries: []
    }

    @ProvideReactive() layoutData: LayoutData = {
        totalHeight: 0,
        cells: []
    }

    @ProvideReactive() renderData: RenderData = {
        cellsToRender: [],
        firstRenderedRowNumber: 0,
        firstRenderedRowOffset: 0
    }

    public created() {
        this.loadMoreData();
        window.addEventListener('resize', this.resize);
        window.addEventListener('scroll', this.scroll);
    }

    public mounted() {
        this.ref = this.$refs.virtualGrid as Element;
        this.computeContainerData();
        this.computeConfigData(this.containerData, this.items);
        this.computeLayoutData(this.configData);
        this.computeRenderData(this.configData, this.containerData, this.layoutData);
        console.log(this.layoutData.totalHeight);
    }

    public beforeDestroy() {
        window.removeEventListener('resize', this.resize);
        window.removeEventListener('scroll', this.scroll);
    }

    private resize() {
        this.computeContainerData();
        this.computeConfigData(this.containerData, this.items);
        this.computeLayoutData(this.configData);
        this.computeRenderData(this.configData, this.containerData, this.layoutData);
    }

    private scroll() {
        this.computeContainerData();
        this.computeInfiniteScroll(this.containerData);
        this.computeConfigData(this.containerData, this.items);
        this.computeLayoutData(this.configData);
        this.computeRenderData(this.configData, this.containerData, this.layoutData);
        // console.log(
        //     this.renderData.cellsToRender.length,
        //     this.renderData.cellsToRender[this.renderData.cellsToRender.length - 1].id
        // );
    }

    private loadMoreData() {
        const newItems = this.updateFunction({ batchSize: this.batchSize, offset: this.offset });
        if (newItems.length === 0) {
            console.log('Bottom reached');
            this.bottomReached = true;
        }
        this.items = [...this.items, ...newItems];
        this.offset += this.batchSize;
    }

    private computeInfiniteScroll(containerData: ContainerData) {
        const windowTop = containerData.windowScroll.y;
        const windowBottom = windowTop + containerData.windowSize.height;

        if (!this.bottomReached &&
            windowBottom > containerData.elementWindowOffset + containerData.elementSize.height - 300) {
            console.log('Loading next batch');
            this.loadMoreData();
        }
    }

    private computeContainerData() {
        const windowSize = this.getWindowSize();
        const windowScroll = this.getWindowScroll();
        const elementWindowOffset = this.getElementOffset(this.ref);
        const elementSize = this.getElementSize(this.ref);

        this.containerData = { windowSize, windowScroll, elementWindowOffset, elementSize };
    }

    private computeConfigData(containerData: ContainerData, items: Item[]) {
        const elementWidth = containerData.elementSize
            ? containerData.elementSize.width
            : null;

        const windowMargin = this.getWindowMargin(containerData.windowSize.height);

        const gridGap = this.getGridGap(elementWidth, containerData.windowSize.height);

        const columnCount = this.getColumnCount(elementWidth);

        const columnWidth = this.getColumnWidth(columnCount, gridGap, elementWidth);

        const entries = items.map((item) => {
            const imageWidth = (columnWidth * item.columnSpan) + (gridGap * (item.columnSpan - 1));
            return {
                ...item,
                height: this.getItemRatioHeight(item.height, item.width, imageWidth),
                width: imageWidth
            };
        });

        this.configData = {
            windowMargin,
            gridGap,
            columnCount,
            entries
        };
    }

    private computeLayoutData(configData: ConfigData) {
        if (configData === null) {
            return;
        };

        let currentRowNumber = 1;
        let prevRowsTotalHeight = 0;
        let currentRowMaxHeight = 0;

        let columnShift = 0;

        const cells: Cell[] = configData.entries.map((entry, index) => {
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

            // we need to count the shift created by multiple column images
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

    private computeRenderData(configData: ConfigData, containerData: ContainerData, layoutData: LayoutData) {
        if (layoutData === null || configData === null) {
            return;
        };
        const cellsToRender: Cell[] = [];
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
                };
                if (cellBottom < renderTop) {
                    continue;
                };

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

    private getColumnWidth(
        columnCount: number | null,
        gridGap: number | null,
        elementWidth: number | null,
    ) {
        if (columnCount === null || gridGap === null || elementWidth === null) {
            return null;
        }

        const totalGapSpace = (columnCount - 1) * gridGap;
        const columnWidth = Math.round((elementWidth - totalGapSpace) / columnCount);

        return columnWidth;
    }

    private getGridRowStart(
        cell: Cell,
        renderData: RenderData | null,
    ) {
        if (renderData === null) {
            return undefined;
        };

        const offset =
            renderData.firstRenderedRowNumber !== null
                ? renderData.firstRenderedRowNumber - 1
                : 0;
        const gridRowStart = cell.rowNumber - offset;

        return `${gridRowStart}`;
    }

    /** UTILS */

    private isSameElementSize(a: ElementSize, b: ElementSize) {
        return a.width === b.width && a.height === b.height;
    }

    private getWindowSize(): ElementSize {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }

    private getElementSize(element: Element): ElementSize {
        const rect = element.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
        };
    }

    private isSameElementScroll(a: ElementScroll, b: ElementScroll) {
        return a.x === b.x && a.y === b.y;
    }

    private getWindowScroll(): ElementScroll {
        return {
            x: window.scrollX,
            y: window.scrollY,
        };
    }

    private getElementOffset(element: Element) {
        return window.scrollY + element.getBoundingClientRect().top;
    }

    /** Custom utils */

    private getGridGap(elementWidth: number, windowHeight: number) {
        if (elementWidth > 720 && windowHeight > 480) {
            return 10;
        } else {
            return 5;
        }
    }

    private getColumnCount(elementWidth: number) {
        return Math.floor(elementWidth / 250);
    }

    private getWindowMargin(windowHeight: number) {
        return Math.round(windowHeight * 1.5);
    }

    private getItemRatioHeight(height: number, width: number, columnWidth: number) {
        const imageRatio = height / width;
        return Math.round(columnWidth * imageRatio);
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
                renderData !== null &&
                renderData.firstRenderedRowOffset !== null
                    ? `${renderData.firstRenderedRowOffset}px`
                    : '0px'
        }"
    >
        <div
            class="grid"
            :style="{
                'grid-template-columns': `repeat(${configData.columnCount}, 1fr)`,
                gap: `${configData.gridGap}px`
            }"
        >
            <template v-for="item in renderData.cellsToRender">
                <div
                    :key="item.id"
                    :style="{
                        height: item.height,
                        'grid-column-start': item.columnNumber,
                        'grid-column-end': item.columnNumber + item.columnSpan,
                        'grid-row-start': getGridRowStart(item, renderData)
                    }"
                    v-html="item.renderContent({ ...item })"
                ></div>
            </template>
        </div>
    </div>
</template>

<style>
.grid {
    display: grid;
    align-items: center;
    margin-bottom: 50px;
}

.image {
    position: relative;
    width: 100%;
    height: auto;
    vertical-align: top;
    background: hsl(0, 0%, 98%);
    transition: 100ms ease;
    transition-property: transform box-shadow;
}
.image:hover {
    z-index: 1;
    transform: scale(1.25);
    box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2),
        0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12);
}
</style>
