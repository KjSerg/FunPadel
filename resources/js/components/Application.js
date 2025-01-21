import {numberInput} from "./forms/_number-input";
import {_parallax} from "./features/_parallax";
import {detectBrowser, hidePreloader, isJsonString, isMobile, showPreloader} from "./utils/_helpers";
import {showPassword} from "./forms/_show-password";
import {selectrickInit} from "./forms/_selectrickInit";
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.css";
import ResizeObserver from "resize-observer-polyfill";
import {toggler} from "./ui/_togglers";
import {creditCart} from "./forms/_credit-card";
import {fancyboxInit} from "../plugins/fancybox-init";
import {Charts} from "./charts/Charts";
import {burger} from "./ui/_burger";
import {accordion} from "./ui/_accardion";
import FormHandler from './forms/FormHandler'
import $ from "jquery";

export default class Application {
    constructor() {
        this.$doc = $(document);
        this.$body = $("body");
        this.init();
    }

    /**
     * Initialize the application components and features.
     */
    init() {
        this.initBrowserAttributes();
        this.initComponents();
        this.initParallax();
        this.initSimpleBar();
    }

    /**
     * Initialize all core components of the application.
     */
    initComponents() {
        this.$doc.ready(() => {
            burger();
            accordion();
            numberInput();
            showPassword();
            selectrickInit();
            toggler();
            creditCart();
            fancyboxInit();
            new Charts();
            const forms = new FormHandler('.form-js');
            this.showLoaderOnClick();
            this.setPlayersMatchTable();
            this.inputMatchListener();
            this.setJsonData();
        });
    }

    showLoaderOnClick() {
        this.$doc.on('click', 'a.show-load, .header a, .footer a', function (e) {
            if (!$(this).attr('href').includes('#')) showPreloader();
        });
    }

    /**
     * Initialize SimpleBar for scrollable content.
     */
    initSimpleBar() {
        window.ResizeObserver = ResizeObserver;

        document.querySelectorAll(".scrollable-content").forEach(container => {
            const simpleBarInstance = new SimpleBar(container);

            if (container.classList.contains("table-wrapper")) {
                this.handleTableScroll(container, simpleBarInstance);
            }
        });
    }

    /**
     * Handle scroll events for table wrappers to synchronize the header position.
     * @param {HTMLElement} container
     * @param {SimpleBar} simpleBarInstance
     */
    handleTableScroll(container, simpleBarInstance) {
        const thead = container.querySelector("thead");
        const tableHeader = container.querySelector(".evolution-table-head");

        if (!thead) return;

        const diffTranslateY = tableHeader ? tableHeader.offsetHeight : 0;
        const scrollElement = simpleBarInstance.getScrollElement();

        scrollElement.addEventListener("scroll", () => {
            const scrollTop = scrollElement.scrollTop;
            const translateY = Math.max(0, scrollTop - diffTranslateY);

            thead.style.transform = `translateY(${translateY}px)`;

            if (scrollTop > 20) {
                thead.classList.add("moved");
            } else {
                thead.classList.remove("moved");
            }
        });
    }

    /**
     * Initialize parallax effects for elements with the class 'parallax-element'.
     */
    initParallax() {
        this.$doc.ready(() => {
            $(".section").each((_, section) => {
                const $section = $(section);
                const $elements = $section.find(".parallax-element");

                if ($elements.length > 0) {
                    _parallax({
                        selector: ".parallax-element",
                        wrapper: $section[0],
                    });
                }
            });
        });
    }

    /**
     * Set browser and device attributes on the <body> tag.
     */
    initBrowserAttributes() {
        const browserName = detectBrowser();
        this.$body.attr("data-browser", browserName).addClass(browserName);

        if (isMobile) {
            this.$body.attr("data-mobile", "mobile");
        }
    }

    setPlayersMatchTable() {
        const $input = this.$doc.find('input[name="match_id"]:checked');
        if (!$input.length) return;

        const matchId = $input.val()?.trim();
        if (!matchId) return;

        showPreloader();

        $.ajax({
            type: "POST",
            url: adminAjax,
            data: {
                action: 'get_match_players',
                match: matchId,
            },
        })
            .done((response) => {
                hidePreloader();

                if (!response) {
                    this.updatePlayersTable('', '0');
                    return;
                }

                if (isJsonString(response)) {
                    const data = JSON.parse(response);
                    this.updatePlayersTable(data.tbody || '', data.count || '0');
                } else {
                    this.updatePlayersTable(response, '0');
                }
            })
            .fail(() => {
                hidePreloader();
                console.error('Error fetching players data.');
                this.updatePlayersTable('', '0');
            });
    }

    updatePlayersTable(tbody = '', count = '0') {
        this.$doc.find('.book-table tbody').html(tbody);
        this.$doc.find('.players-count').html(count);
    }

    inputMatchListener() {
        const $input = this.$doc.find('input[name="match_id"]');
        $input.on('change', () => this.setPlayersMatchTable());
    }

    setJsonData() {
        $(document).on('click', '.set-json-data-js', function (e) {
            const $t = $(this);
            const data = $t.attr('data-json');
            const selector = $t.attr('data-selector');
            $(document).find(selector).val(data);
        });
    }
}
