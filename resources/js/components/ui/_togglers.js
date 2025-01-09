export const toggler = () => {
    const $doc = $(document);
    $doc.on('click', '.toggle-class', function (e) {
        e.preventDefault();
        const $t = $(this);
        const isActive = $t.hasClass('active');
        const href = $t.attr('href');
        const cls = $t.attr('data-class') || 'active';
        if (href === undefined) return;
        const $elem = $doc.find(href);
        if ($elem.length === 0) return;
        if (isActive) {
            $t.removeClass('active');
            $elem.removeClass(cls);
        } else {
            $t.addClass('active');
            $elem.addClass(cls);
            if($(window).height() <= 500){
                $('html, body').animate({
                    scrollTop: $elem.offset().top
                })
            }
        }
    });
}