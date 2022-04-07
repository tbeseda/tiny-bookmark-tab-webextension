/** @param {import('webextension-polyfill').Browser} browser */
function main(browser) {
  function installed (details) {
    if (details.reason === 'install') {
      console.log('INSTALLED')
    } else if (details.reason === 'update') {
      console.log('UPDATED')
    }
  }

  function openTiny() {
    browser.runtime.openOptionsPage();
  }

  browser.runtime.onInstalled.addListener(installed);
  browser.browserAction.onClicked.addListener(openTiny);
}

// @ts-ignore
main(window.browser)
