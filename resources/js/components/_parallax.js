import {isEven, randomIntFromInterval, invertNumber, isMobile} from "./_helpers";

export const _parallax = (args = {}) => {
    let {selector, wrapper} = args;
    if (wrapper === undefined) {
        wrapper = document;
    }
    if (selector === undefined) {
        selector = '.head-section-decor-balls span';
    }
    if (!isMobile) {
        let depthCoefficient = Number(randomIntFromInterval(10, 60));
        const layers = wrapper.querySelectorAll(selector);
        wrapper.addEventListener("mousemove", (e) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            let y = (e.clientY / window.innerHeight) - 0.5;
            layers.forEach((layer, index) => {
                depthCoefficient = isEven(index) ? depthCoefficient - (index + 1) : depthCoefficient + (index + 1);
                const depth = (index + 1) * depthCoefficient / 10;
                let xOffset = x * depth;
                let yOffset = y * depth;
                xOffset = isEven(index) ? invertNumber(xOffset) : xOffset;
                yOffset = isEven(index) ? invertNumber(yOffset) : yOffset;
                layer.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });
        });
    }
};