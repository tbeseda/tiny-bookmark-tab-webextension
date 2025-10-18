let isPopup = false;
let openFolders = new Set();
let storage = null;
let filtering = false;

function Favicon(bookmark) {
	const url = new URL(bookmark.url);

	if (url.hostname.length > 0) {
		const domain = url.hostname;
		// * options: https://blog.jim-nielsen.com/2021/displaying-favicons-for-any-domain/
		const imageUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`; // more reliable
		// const imageUrl = `https://www.google.com/s2/favicons?domain=${domain}`; // "real" png

		return `<img height="20" width="20" src="${imageUrl}" alt="${domain} favicon">`;
	}

	return "";
}

function List(bookmarks) {
	const markup = bookmarks
		.map((bookmark) =>
			typeof bookmark.children === "undefined"
				? Item(bookmark)
				: Folder(bookmark),
		)
		.join("");

	return `<ul>${markup}</ul>`;
}

function Item(bookmark) {
	return `
<li>
	<a href="${bookmark.url}" ${isPopup ? 'target="_blank"' : ""}>
		${Favicon(bookmark)}
		<span>${bookmark.title}</span>
	</a>
</li>`;
}

function Folder(bookmark) {
	const { id } = bookmark;
	const open = openFolders.has(id) ? 'open' : '';
	return `
<li>
	<details data-bookmark-id="${id}" ${open}>
		<summary>${bookmark.title} (${bookmark.children.length})</summary>
		${List(bookmark.children)}
	</details>
</li>`;
}

function filterBookmarks(bookmarks, query) {
	if (!query) return bookmarks;

	return bookmarks.map(bookmark => {
		if (bookmark.children) {
			const filteredChildren = filterBookmarks(bookmark.children, query);
			return filteredChildren.length > 0
				? { ...bookmark, children: filteredChildren }
				: null;
		}

		return (bookmark.title.toLowerCase().includes(query) ||
			bookmark.url?.toLowerCase().includes(query))
			? bookmark
			: null;
	}).filter(Boolean);
}

function renderBookmarks(bookmarks, $container, openAll = false) {
	$container.innerHTML = List(bookmarks);
	const $details = $container.querySelectorAll('details');

	if (openAll) for (const $d of $details) $d.setAttribute('open', '');
	else if (openFolders.size === 0) $details[0]?.setAttribute('open', '');
}

async function main(browser) {
	const $main = document.getElementById("main");
	if (!$main) throw new Error("No #main element found");

	const tree = await browser.bookmarks.getTree();
	const sorted = tree[0].children.sort((a, b) => {
		return b.children?.length - a.children?.length;
	});

	const $filter = document.createElement('input');
	$filter.id = 'filter';
	$filter.type = 'search';
	$filter.placeholder = 'Filter...';
	$filter.style.display = 'block';
	$filter.style.margin = '10px auto';
	$main.appendChild($filter);

	const $listContainer = document.createElement('div');
	$main.appendChild($listContainer);

	const $reset = document.createElement('button');
	$reset.textContent = 'Collapse All';
	$reset.title = 'Clear saved folder state';
	$reset.style.display = 'block';
	$reset.style.margin = '0 auto 10px';
	$reset.style.padding = '0.25rem 0.5rem';
	$reset.style.cursor = 'pointer';
	$main.appendChild($reset);

	renderBookmarks(sorted, $listContainer);

	$listContainer.addEventListener('toggle', (e) => {
		if (filtering) return;
		if (e.target && e.target instanceof HTMLDetailsElement) {
			const id = e.target.dataset.bookmarkId;
			if (e.target.open) {
				openFolders.add(id);
				storage.set({ openFolders: [...openFolders] });
			}
			else {
				openFolders.delete(id);
				storage.set({ openFolders: [...openFolders] });
			}
		}
	}, true);


	$filter.addEventListener('input', (e) => {
		const query = $filter.value.toLowerCase();
		filtering = query.length > 0;
		const filtered = filterBookmarks(sorted, query);
		renderBookmarks(filtered, $listContainer, filtering);
	});

	$reset.addEventListener('click', () => {
		openFolders.clear();
		storage.set({ openFolders: [] });
		renderBookmarks(sorted, $listContainer);
	});

	$filter.focus();
}

document.addEventListener('DOMContentLoaded', async () => {
	// @ts-ignore these exist in the extension context
	const chrome = window.chrome || window.browser;
	if (!chrome) return false;

	storage = chrome.storage.local;

	const tab = await chrome.tabs.getCurrent();
	isPopup = !tab;

	const storageResult = await storage.get('openFolders');
	openFolders = new Set(storageResult?.openFolders || []);

	main(chrome);
});
