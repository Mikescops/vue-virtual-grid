/** Custom Utils (you can redefine them in component template) */
export const getGridGapDefault = (elementWidth: number, windowHeight: number) => {
    if (elementWidth > 720 && windowHeight > 480) {
        return 10;
    } else {
        return 5;
    }
};

export const getColumnCountDefault = (elementWidth: number) => {
    return Math.floor(elementWidth / 250);
};

export const getWindowMarginDefault = (windowHeight: number) => {
    return Math.round(windowHeight * 1.5);
};

export const getItemRatioHeightDefault = (height: number, width: number, columnWidth: number) => {
    const imageRatio = height / width;
    return Math.round(columnWidth * imageRatio);
};
