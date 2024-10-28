let isPopup = false;

function Favicon(bookmark) {
	const url = new URL(bookmark.url);

	if (url.hostname.length > 0) {
		const domain = url.hostname;
		// * options: https://blog.jim-nielsen.com/2021/displaying-favicons-for-any-domain/
		// const imageUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`; // more reliable
		const imageUrl = `https://www.google.com/s2/favicons?domain=${domain}`; // "real" png

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
		<!-- ${Favicon(bookmark)} -->
		<span>${bookmark.title}</span>
	</a>
</li>`;
}

function Folder(bookmark) {
	return `
<li>
	<details>
		<summary>${bookmark.title} (${bookmark.children.length})</summary>
		${List(bookmark.children)}
	</details>
</li>`;
}

async function main(browser) {
	const $main = document.getElementById("main");
	if (!$main) throw new Error("No #main element found");

	$main.innerHTML = "Loading...";

	const tree = await browser.bookmarks.getTree();

	const sorted = tree[0].children.sort((a, b) => {
		return b.children?.length - a.children?.length;
	});

	$main.innerHTML = List(sorted);
	$main.querySelector("details")?.setAttribute("open", "");
}

document.addEventListener("DOMContentLoaded", () => {
	// @ts-ignore
	const chrome = window.chrome || window.browser;
	if (!chrome) return false;

	isPopup = chrome.extension.getViews({ type: "popup" })?.length > 0;
	main(chrome); // Firefox has both, Chrome is missing browser
});
