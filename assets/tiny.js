function Favicon(bookmark) {
  const url = new URL(bookmark.url)

  if (url.hostname.length > 0) {
    const domain = url.hostname
    const imageUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`

    return `
<img
  class="h-3 w-3"
  src="${imageUrl}"
  alt="${domain} favicon"
>
    `.trim()
  } else {
    return ''
  }
}

function List(bookmarks) {
  return `
<ul
  class="pl-2"
>
  ${bookmarks
    .map(
      (bookmark) => `
        ${bookmark.type === 'bookmark' ? Item(bookmark) : ''}
        ${
          bookmark.type === 'folder' && bookmark.children.length > 0
            ? Folder(bookmark)
            : ''
        }
      `
    )
    .join('')}
</ul>
  `.trim()
}

function Item(bookmark) {
  return `
<li
  class="ml-1 pl-2 border-l-2 border-slate-300 dark:border-gray-700"
>
  <a
    class="flex items-center gap-x-2 px-1 py-0.5 hover:bg-gray-200 dark:hover:bg-slate-700"
    href="${bookmark.url}"
  >
    ${Favicon(bookmark)}
    <span class="truncate text-blue-500 dark:text-blue-300">${bookmark.title}</span>
  </a>
</li>
  `.trim()
}

function Folder(bookmark) {
  return `
<li
  class="mt-2"
>
  <span
    class="font-semibold text-gray-600 dark:text-gray-200"
  >
    ${bookmark.title} (${bookmark.children.length})
  </span>
  ${List(bookmark.children)}
</li>
  `.trim()
}

/** @param {import('webextension-polyfill').Browser} browser */
async function main(browser) {
  const tree = await browser.bookmarks.getTree()
  document.getElementById('main').innerHTML = List(tree[0].children)
}

// @ts-ignore
main(window.browser)
