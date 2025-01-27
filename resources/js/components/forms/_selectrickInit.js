import 'selectric';

export const selectrickInit = () => {
    const $select = $(document).find('.select').not('.selectric-init');
    $select.selectric();
    $select.addClass('selectric-init');
}