function Favicon(bookmark) {
	const url = new URL(bookmark.url);

	if (url.hostname.length > 0) {
		const domain = url.hostname;
		const imageUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;

		return `<img src="${imageUrl}" alt="${domain} favicon">`.trim();
	}

	return "";
}

function List(bookmarks) {
	console.table(bookmarks);
	return `
<ul>
  ${bookmarks
		.map(
			(bookmark) => `
        ${
					typeof bookmark.children === "undefined"
						? Item(bookmark)
						: Folder(bookmark)
				}
      `,
		)
		.join("")}
</ul>
  `.trim();
}

function Item(bookmark) {
	return `
<li>
  <a href="${bookmark.url}">
    ${Favicon(bookmark)}
    <span>${bookmark.title}</span>
  </a>
</li>
  `.trim();
}

function Folder(bookmark) {
	return `
<li>
  <span>
    ${bookmark.title} (${bookmark.children.length})
  </span>
  ${List(bookmark.children)}
</li>
  `.trim();
}

/** @param {import('webextension-polyfill').Browser} browser */
async function main(browser) {
	const $main = document.getElementById("main");
	if (!$main) throw new Error("No #main element found");
	$main.innerHTML = "Loading...";
	const tree = await browser.bookmarks.getTree();
	$main.innerHTML = List(tree[0].children);
}

console.log("booting");

document.addEventListener("DOMContentLoaded", function () {
	// TODO: bifurcate for Firefox vs Chrome
	if (typeof browser === "undefined") {
		// Chrome
		main(chrome);
	} else {
		// Firefox
		main(browser);
	}
});
