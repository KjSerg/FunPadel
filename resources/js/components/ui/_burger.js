export const burger = () => {
    const $doc = $(document);
    $doc.on('click', '.burger', function (e) {
        e.preventDefault();
        const $t = $(this);
        const isActive = $t.hasClass('active');
        const $menu = $doc.find('.header-menu');
        if (isActive) {
            $t.removeClass('active');
            $menu.removeClass('active');
        } else {
            $t.addClass('active');
            $menu.addClass('active');
        }
    })
}