(function ($) {
    $.fn.title = function () {
        this.each(function () {
            const $t = $(this);
            if (!$t.hasClass('element-changed')) {
                const html = $t.html().trim();
                const text = $t.text().trim();
                $t.html(getEleHTML(html, text));
                $t.addClass('element-changed');
            }
        });
        return this;
    };
})(jQuery);

function getEleHTML(html, text) {
    return `
    <span class="title-text-main">${html}</span>
    <span class="title-text-bg">${text}</span>
    `;
}