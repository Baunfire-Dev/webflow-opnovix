export const prepareNewsCards = (root) => {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    root.querySelectorAll('.news-date').forEach(el => {
        const date = new Date(el.textContent.trim());
        if (Number.isNaN(date.getTime())) return;
        el.textContent = `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    });

    root.querySelectorAll('[data-external-url]').forEach(card => {
        const url = card.dataset.externalUrl.trim();
        const icon = card.querySelector('.news-icon-ext');
        const external = Boolean(url && icon && !icon.classList.contains('w-condition-invisible'));

        card.classList.toggle('is-external', external);
        if (!external) return;

        card.setAttribute('href', url);
        card.setAttribute('target', '_blank');
        card.setAttribute('rel', 'noopener noreferrer');
    });
};
