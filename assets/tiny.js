function Favicon(bookmark) {
	const url = new URL(bookmark.url);

	if (url.hostname.length > 0) {
		const domain = url.hostname;
		// * options: https://blog.jim-nielsen.com/2021/displaying-favicons-for-any-domain/
		const imageUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`; // more reliable
		// const imageUrl = `https://www.google.com/s2/favicons?domain=${domain}`; // "real" png

		return `<img height=20 width=20 src="${imageUrl}" alt="${domain} favicon">`.trim();
	}

	return "";
}

function List(bookmarks) {
	return bookmarks
		.map((bookmark) =>
			typeof bookmark.children === "undefined"
				? Item(bookmark)
				: Folder(bookmark),
		)
		.join("");
}

function Item(bookmark) {
	return `
<div>
	<a href="${bookmark.url}">
		${Favicon(bookmark)}
		<span>${bookmark.title}</span>
	</a>
</div>`;
}

function Folder(bookmark) {
	return `
<details>
	<summary>${bookmark.title} (${bookmark.children.length})</summary>
	${List(bookmark.children)}
</details>`;
}

/** @param {import('webextension-polyfill').Browser} browser */
async function main(browser) {
	const $main = document.getElementById("main");
	if (!$main) throw new Error("No #main element found");

	$main.innerHTML = "Loading...";

	const tree = await browser.bookmarks.getTree();

	$main.innerHTML = List(tree[0].children?.reverse());
}

document.addEventListener("DOMContentLoaded", function () {
	if (typeof chrome !== "undefined") {
		main(chrome);
	} else if (typeof browser !== "undefined") {
		main(browser); // Firefox
	}
});
