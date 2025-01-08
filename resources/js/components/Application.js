import {burger} from "./_burger";
import {accordion} from "./_accardion";
import {numberInput} from "./_number-input";
import {_parallax} from "./_parallax";
import './$.title'
import {detectBrowser, isMobile} from "./_helpers";
import {showPassword} from "./_show-password";
import {selectrickInit} from "./_selectrickInit";
import SimpleBar from "simplebar";
import 'simplebar/dist/simplebar.css';
import ResizeObserver from 'resize-observer-polyfill';
import {toggler} from "./_togglers";
import {creditCart} from "./_credit-card";
import {fancyboxInit} from "./fancybox-init";
import {Charts} from "./Charts";

export default class Application {
    constructor() {
        this.$doc = $(document);
        this.$body = $('body');
        this.initComponents();
        this.parallaxInit();
    }

    initComponents() {
        const t = this;
        const $doc = t.$doc;
        t.simpleBarInit();
        $doc.ready(function () {
            burger();
            accordion();
            numberInput();
            showPassword();
            t.setBrowserDataName();
            selectrickInit();
            toggler();
            creditCart();
            fancyboxInit();
            const chart = new Charts();
        });
    }

    simpleBarInit() {
        window.ResizeObserver = ResizeObserver;
        const simpleBarContainers = document.querySelectorAll('.scrollable-content');
        simpleBarContainers.forEach(function (simpleBarContainer) {
            const simpleBarInstance = new SimpleBar(simpleBarContainer);
            if (simpleBarContainer.classList.contains('table-wrapper')) {
                const thead = simpleBarContainer.querySelector('thead');
                const tableHeader = simpleBarContainer.querySelector('.evolution-table-head');
                if (thead) {
                    let diffTranslateY = 0;
                    if (tableHeader) {
                        diffTranslateY = tableHeader.offsetHeight;
                    }
                    const scrollElement = simpleBarInstance.getScrollElement();
                    scrollElement.addEventListener('scroll', () => {
                        const scrollTop = scrollElement.scrollTop;
                        const scrollHeight = scrollElement.scrollHeight;
                        const clientHeight = scrollElement.clientHeight;
                        const maxScrollValue = scrollHeight - clientHeight;
                        let translateY = scrollTop === 0 ? scrollTop : scrollTop - 2;
                        if (diffTranslateY) {
                            translateY = scrollTop === 0 ? translateY : translateY - diffTranslateY;
                        }
                        thead.style.transform = `translateY(${translateY}px)`;
                        if (scrollTop > 20) {
                            thead.classList.add('moved');
                        } else {
                            thead.classList.remove('moved');
                        }
                    });
                }

            }
        });
    }

    parallaxInit() {
        const t = this;
        const $doc = t.$doc;
        $doc.ready(function () {
            $doc.find('.section').each(function () {
                const $section = $(this);
                const $elements = $section.find('.parallax-element');
                if ($elements.length > 0) {
                    _parallax({
                        selector: '.parallax-element',
                        wrapper: $section[0]
                    });
                }
            });
        });
    }

    setBrowserDataName() {
        const t = this;
        const $body = t.$body;
        const name = detectBrowser();
        $body.attr('data-browser', name).addClass(name);
        if (isMobile) $body.attr('data-mobile', 'mobile');
    }
}