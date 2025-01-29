import {numberInput} from "./forms/_number-input";
import {_parallax} from "./features/_parallax";
import {detectBrowser, getQueryParams, hidePreloader, isJsonString, isMobile, showPreloader} from "./utils/_helpers";
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
        this.parser = new DOMParser();
        this.init();
    }

    /**
     * Initialize the application components and features.
     */
    init() {
        this.initBrowserAttributes();
        this.initComponents();
        this.initParallax();
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
            this.initSimpleBar();
            this.getFilterFormsHTML();
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
        const diffTranslateY = tableHeader?.offsetHeight || 0;
        const scrollElement = simpleBarInstance.getScrollElement();

        const updateTableHeader = () => {
            const scrollTop = scrollElement.scrollTop;
            const translateY = Math.max(0, scrollTop - diffTranslateY);

            if (thead) {
                thead.style.transform = `translateY(${translateY}px)`;
                thead.classList.toggle("moved", scrollTop > 20);
            }
        };

        const handleScrollEnd = () => {
            if (this.isSimpleBarScrolledToEnd(scrollElement)) {
                this.getNextTableRowsHtml(container);
            }
        };

        scrollElement.addEventListener("scroll", () => {
            updateTableHeader();
            handleScrollEnd();
        });
        updateTableHeader();
        handleScrollEnd();
    }

    isSimpleBarScrolledToEnd(scrollElement) {
        return scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 1;
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
                        selector: ".parallax-element", wrapper: $section[0],
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
            type: "POST", url: adminAjax, data: {
                action: 'get_match_players', match: matchId,
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

    async getNextTableRowsHtml(container) {
        const parser = this.parser;
        const url = container.getAttribute('data-next-post-url');
        const isLoading = container.getAttribute('data-loading') === 'loading';
        const $container = $(container).find('tbody');

        if (isLoading || !url) return;

        container.setAttribute('data-loading', 'loading');
        showPreloader();

        try {
            const response = await $.ajax({
                type: "GET", url: url,
            });

            hidePreloader();

            if (!response) {
                console.warn('Empty response received.');
                return;
            }

            const $parsedHtml = $(parser.parseFromString(response, "text/html"));
            const $content = $parsedHtml.find('.scrollable-content');
            const nextPostUrl = $content.attr('data-next-post-url') || '';
            const newRows = $parsedHtml.find('tbody').html();

            if (newRows) {
                $container.append(newRows);
                container.setAttribute('data-next-post-url', nextPostUrl);
            } else {
                console.warn('No new rows found in the response.');
            }
        } catch (error) {
            console.error('Error fetching players data:', error);
            container.setAttribute('data-loading', '');
            this.getNextTableRowsHtml(container); // Retry
        } finally {
            container.setAttribute('data-loading', '');
            hidePreloader();
        }
    }

    getFilterFormsHTML() {
        const $matchesTable = this.$doc.find('.matches-table');
        const $leaderboardTable = this.$doc.find('.leaderboard-table');
        if ($matchesTable.length === 0 && $leaderboardTable.length === 0) return;
        const data = getQueryParams();
        data.action = 'get_matches_filters_html';
        data.table = $matchesTable.length > 0 ? 'matches' : 'leaderboard';
        setTimeout(function () {
            $.ajax({
                type: 'POST', url: adminAjax, data: data,
            }).done((response) => {
                const isJson = isJsonString(response);
                if (isJson) {
                    const responseData = JSON.parse(response);
                    if (responseData.season_form_filter_html) {
                        $(document).find('#season_form_filter_html').append(responseData.season_form_filter_html);
                    }
                    if (responseData.leagues_form_filter_html) {
                        $(document).find('#leagues_form_filter_html').append(responseData.leagues_form_filter_html);
                    }
                    selectrickInit();
                }
            });
        }, 1000);

    }

}
