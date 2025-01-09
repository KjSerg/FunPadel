export const accordion = () => {
    $(document).on('click', '.accordion-head', function (e) {
        e.preventDefault();
        const $this = $(this);
        const $element = $this.closest('.accordion');
        const $content = $element.find('.accordion-content');
        let $section = $element.closest('section');
        $section = $section.length === 0 ? $element.closest('footer') : $section;
        $section = $section.length === 0 ? $element.closest('header') : $section;
        const isShowed = $element.hasClass('active');
        $section.find('.accordion').not($element).find('.accordion-content').slideUp();
        $section.find('.accordion').not($element).removeClass('active');
        if (isShowed) {
            $element.removeClass('active');
            $content.slideUp(200);
        } else {
            $element.addClass('active');
            $content.slideDown(200);
        }
    });
}

function hideContent() {
    $(document).find('.accordion:not(.active) .accordion-content').hide();
}