function List(bookmarks) {
  return `
<ul>
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
<li><a class="link" href="${bookmark.url}">${bookmark.title}</a></li>
  `.trim()
}

function Folder(bookmark) {
  return `
<li>
  <strong class="title">${bookmark.title} (${bookmark.children.length})</strong>
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
