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
  class="truncate ml-1 pl-2 border-l-2 border-slate-300 dark:border-gray-700"
>
  <a
    class="p-1 text-blue-500 hover:bg-gray-200 dark:text-blue-300 dark:hover:bg-slate-700"
    href="${bookmark.url}"
  >
    ${bookmark.title}
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
