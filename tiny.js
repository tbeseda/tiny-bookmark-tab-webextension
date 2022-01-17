function createList(bookmarks) {
  const root = document.createElement('ul')

  for (const bookmark of bookmarks) {
    const item = document.createElement('li')

    if (bookmark.type === 'bookmark') {
      const contents = document.createElement('a')
      const title = document.createTextNode(bookmark.title)
      contents.setAttribute('href', bookmark.url)
      contents.appendChild(title)

      item.appendChild(contents)
      root.appendChild(item)
    } else if (bookmark.type === 'folder' && bookmark.children.length > 0) {
      const contents = document.createTextNode(`${bookmark.title} (${bookmark.children.length})`)

      item.appendChild(contents)
      root.appendChild(item)
      root.appendChild(createList(bookmark.children))
    }
  }

  return root
}

/** @param {import('webextension-polyfill').Browser} browser */
async function main(browser) {
  const tree = await browser.bookmarks.getTree()
  const list = createList(tree[0].children)

  const main = document.getElementById('main')
  main.appendChild(list)
}

// @ts-ignore
main(window.browser)
