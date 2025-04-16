import $ from 'jquery';

window.$ = $;
window.jQuery = $;
import '@fancyapps/fancybox';

export const fancyboxInit = () => {
    $('[data-fancybox]').fancybox({});
    $(document).on('click', '.fancybox', function (e) {
        e.preventDefault();
        const $t = $(this);
        const href = $t.attr('href');
        if (href === undefined) return;
        const $el = $(document).find(href);
        if ($el.length === 0) return;
        $.fancybox.open($el);
    });
    $(document).on('click', '.close-fancybox-modal', function (e) {
        e.preventDefault();
        $.fancybox.close();
    });
    showNotices();
};

function showNotices() {
    if (message_list) {
        for (let a = 0; a < message_list.length; a++) {
            let item = message_list[a];
            let type = item.type;
            let message = item.text;
            const selector = '#dialog' + (type ? '-' + type : '');
            const $modal = $(document).find(selector);
            if ($modal.length === 0) {
                alert(message);
                return;
            }
            $modal.find('.modal__title').html(message);
            $.fancybox.open($modal);
            setTimeout(() => $.fancybox.close(), 3000);
        }
    }
}
