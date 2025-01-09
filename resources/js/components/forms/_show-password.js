export const showPassword = () => {
    const $doc = $(document);
    $doc.on('click', '.show-password', function (e) {
        e.preventDefault();
        const $t = $(this);
        const isActive = $t.hasClass('active');
        const $input = $t.closest('label').find('input');
        if ($input.length === 0) return;
        if (isActive) {
            $t.removeClass('active');
            $input.attr('type', 'password');
        } else {
            $t.addClass('active');
            $input.attr('type', 'text');
        }
    })
}