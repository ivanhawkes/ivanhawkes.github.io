/* The lightbox of the galleries `layouts/_shortcodes/gallery.html` writes.

   Each thumbnail is a link to a larger copy of its photo, which is what a reader
   without scripts gets. This script opens that copy in one shared, modal
   `<dialog>` instead, with the photo's caption, its place in the set, and
   previous and next controls; the arrow keys step through the set, and Escape,
   the close control or a click on the backdrop closes it. The dialog returns
   focus to the thumbnail that opened it.

   The dialog is built with DOM calls, not markup strings, so it needs no
   Trusted Types policy under the site's Content Security Policy. */

type Photo = {
    href: string;
    alt: string;
    caption: string;
    width: string;
    height: string;
};

const button = (className: string, label: string, text: string) => {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = className;
    element.setAttribute('aria-label', label);
    element.textContent = text;
    return element;
};

const buildDialog = () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Photo viewer');

    const stage = document.createElement('div');
    stage.className = 'lightbox-stage';
    const img = document.createElement('img');
    img.className = 'lightbox-img';
    img.decoding = 'async';
    stage.append(img);

    const bar = document.createElement('div');
    bar.className = 'lightbox-bar';
    const previous = button('lightbox-previous', 'Previous photo', '‹');
    const next = button('lightbox-next', 'Next photo', '›');
    const caption = document.createElement('p');
    caption.className = 'lightbox-caption';
    caption.setAttribute('aria-live', 'polite');
    bar.append(previous, caption, next);

    const close = button('lightbox-close', 'Close the photo viewer', '×');
    dialog.append(stage, bar, close);
    document.body.append(dialog);

    return { dialog, img, caption, previous, next, close };
};

let viewer: ReturnType<typeof buildDialog> | null = null;
let photos: Photo[] = [];
let current = 0;

const show = (index: number) => {
    if (!viewer) {
        return;
    }
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    viewer.img.src = photo.href;
    viewer.img.alt = photo.alt;
    viewer.img.width = Number(photo.width);
    viewer.img.height = Number(photo.height);
    const place = `Photo ${current + 1} of ${photos.length}`;
    viewer.caption.textContent = photo.caption
        ? `${photo.caption} (${place})`
        : place;
    const single = photos.length < 2;
    viewer.previous.hidden = single;
    viewer.next.hidden = single;
};

const open = (set: Photo[], index: number) => {
    if (!viewer) {
        viewer = buildDialog();
        viewer.previous.addEventListener('click', () => show(current - 1));
        viewer.next.addEventListener('click', () => show(current + 1));
        viewer.close.addEventListener('click', () => viewer?.dialog.close());
        viewer.dialog.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                show(current - 1);
                event.preventDefault();
            } else if (event.key === 'ArrowRight') {
                show(current + 1);
                event.preventDefault();
            }
        });
        // A click on the backdrop, outside the photo and the controls, closes.
        viewer.dialog.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const dialog = viewer?.dialog;
            if (
                dialog &&
                (target === dialog ||
                    target.classList.contains('lightbox-stage'))
            ) {
                dialog.close();
            }
        });
        viewer.dialog.addEventListener('close', () => {
            viewer?.img.removeAttribute('src');
        });
    }
    photos = set;
    show(index);
    viewer.dialog.showModal();
    viewer.close.focus();
};

export const initGalleries = () => {
    document.querySelectorAll<HTMLElement>('.gallery').forEach((gallery) => {
        const links = Array.from(
            gallery.querySelectorAll<HTMLAnchorElement>('.gallery-link')
        );
        const set: Photo[] = links.map((link) => ({
            href: link.href,
            alt: link.querySelector('img')?.alt ?? '',
            caption: link.dataset.caption ?? '',
            width: link.dataset.width ?? '',
            height: link.dataset.height ?? '',
        }));
        links.forEach((link, index) => {
            link.addEventListener('click', (event) => {
                // A modified click keeps its usual meaning: a new tab or window.
                if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.button !== 0
                ) {
                    return;
                }
                event.preventDefault();
                open(set, index);
            });
        });
    });
};

initGalleries();
