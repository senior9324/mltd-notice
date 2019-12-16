// ==UserScript==
// @name MLTD Notice
// @description Prettify MLTD Notice Page.
// @version 19121601
// @author senior9324
// @run-at document-idle
// @match https://webview-dot-theaterdays.appspot.com/*
// @match https://webview-dot-theaterdays-ko.appspot.com/*
// @match https://webview-dot-theaterdays-zh.appspot.com/*
// @grant GM_setClipboard
// @grant GM_xmlhttpRequest
// @grant GM_setValue
// @grant GM_getValue
// @grant GM.setClipboard
// @grant GM.xmlHttpRequest
// @grant GM.setValue
// @grant GM.getValue
// @connect senior9324.github.io
// @require https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @downloadURL https://senior9324.github.io/mltd-notice/mltd.notice.user.js
// ==/UserScript==

(async function() {
  const i18n = {
    lang: {
      ja: '日本語',
      en: 'English',
      ko: '한국어',
      zh: '中文 (繁體)'
    },
    data: {
      ja: {
        title: 'お知らせ',
        update: '更新情報',
        event: '開催情報',
        bug: '不具合情報',
        share: '共有',
        linkCopied: 'リンクをクリップボードにコピーしました'
      },
      en: {
        title: 'Notice',
        update: 'Update',
        event: 'Event',
        bug: 'Bug',
        share: 'Share',
        linkCopied: 'Link copied to clipboard'
      },
      ko: {
        title: '공지사항',
        update: '갱신 정보',
        event: '진행 정보',
        bug: '오류 정보',
        share: '공유',
        linkCopied: '링크를 클립보드에 복사했습니다'
      },
      zh: {
        title: '公告',
        update: '更新資訊',
        event: '舉辦資訊',
        bug: '問題資訊',
        share: '分享',
        linkCopied: '已將連結複製到剪貼簿'
      }
    }
  }

  function doXHR(data) {
    if (data.onload || data.onerror) {
      throw new Error('Do not use callback pattern to call this function.')
    } else {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest(Object.assign(
          data,
          {
            onload: resolve,
            onerror: reject
          }
        ))
      })
    }
  }

  async function getNowBg() {
    let res = await doXHR({
      method: 'GET',
      url: 'https://senior9324.github.io/mltd-notice/bg-data.json',
      responseType: 'json'
    })

    const { specialBg, bgList } = res.response

    if (specialBg.end && (Date.now() <= specialBg.end)) {
      return specialBg.bg
    } else {
      return bgList[Math.floor(Math.random() * bgList.length)]
    }
  }

  function searchParentLink(elem, lastElem) {
    while (elem.nodeName !== 'A') {
      elem = elem.parentNode
      if (elem === lastElem || elem === document.body) {
        return false
      }
    }
    return elem
  }

  function removeAttributes(elem) {
    while (elem.attributes.length > 0)
      elem.removeAttribute(elem.attributes[0].name)
  }

  let stylesheet = `
  @keyframes hide {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      visibility: hidden;
    }
  }

  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .bg {
    position: fixed;
    width: 100%;
    height: 100%;
    background-image: url("${await getNowBg()}");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    filter: blur(5px);
    cursor: pointer;
    transform: scale(1.02);
    transition: transform 250ms;
  }

  .bgmode .bg {
    filter: none;
    transform: scale(1);
  }

  .container {
    position: relative;
    border-radius: 30px 30px 0 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 920px;
    height: 100%;
    margin: 0 auto;
    opacity: 1;
    transition: visibility 500ms, opacity 500ms;
  }

  .bgmode .container {
    visibility: hidden;
    opacity: 0;
  }

  header {
    background-image: linear-gradient(#feea8b, #dbc877, #c4b36b);
    border-radius: 30px 30px 0 0;
    -webkit-user-select: none;
    user-select: none;
  }

  header h1 {
    float: left;
    margin: 0;
    padding: 10px 20px;
    font-size: 16px;
  }

  #tablist {
    float: left;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  #tablist li {
    display: inline-block;
  }

  #tablist li a {
    display: inline-block;
    margin-top: 6px;
    padding-bottom: 6px;
    color: black;
    text-decoration: none;
    transform: skewX(8deg);
  }

  #tablist li a .border {
    padding: 4px 20px 4px 20px;
    border-right: 1px solid black;
    display: inline-block;
  }

  #tablist li:first-child a .border {
    border-left: 1px solid black;
  }

  #tablist li a .border > span {
    transform: skewX(-8deg);
    display: inline-block;
  }

  #tablist li a.click {
    background: white;
  }

  .mltdsharebtn {
    float: right;
    display: inline-block;
    padding: 10px 20px;
    color: black;
    text-decoration: none;
  }

  .changelang {
    float: right;
    margin: 12px 0;
  }

  iframe {
    clear: both;
    flex-grow: 1;
    box-sizing: border-box;
    height: 100%;
    display: inline-block;
    border: 0;
  }
  `

  if (unsafeWindow === unsafeWindow.parent) {
    let langCode = await GM.getValue('lang', 'ja')

    let intendedPage = location.pathname + location.hash

    if (!intendedPage.includes('info/google#') && !intendedPage.includes('info/apple#')) {
      intendedPage = '/info/google#/update'
    }

    // Clear Data
    document.head.innerHTML = ''
    document.body.innerHTML = ''

    removeAttributes(document.head)
    removeAttributes(document.body)
    removeAttributes(document.documentElement)

    history.replaceState(null, i18n.data[langCode].title, '/')

    let browserTitle = document.createElement('title')
    browserTitle.textContent = i18n.data[langCode].title
    document.head.appendChild(browserTitle)

    let style = document.createElement('style')
    style.textContent = stylesheet
    document.head.appendChild(style)

    let bg = document.createElement('div')
    bg.className = 'bg'
    bg.addEventListener('click', function (e) {
      document.body.classList.toggle('bgmode')
    })
    document.body.appendChild(bg)

    let container = document.createElement('div')
    container.className = 'container'

    let iframe = document.createElement('iframe')
    iframe.src = intendedPage
    iframe.name = 'mainFrame'

    let header = document.createElement('header')

    let title = document.createElement('h1')
    title.textContent = i18n.data[langCode].title
    header.appendChild(title)

    let tablist = document.createElement('ul')
    tablist.id = 'tablist'
    tablist.innerHTML = (function() {
      const tabtypelist = ['update', 'event', 'bug']
      let result = ''
      for (const tabtype of tabtypelist) {
        result += `<li><a data-tab="${tabtype}" ${(intendedPage.includes(tabtype) ? 'class="click" ': '')}href="/info/google#/${tabtype}" target="mainFrame"><span class="border"><span>${i18n.data[langCode][tabtype]}</span></span></a></li>`
      }
      return result
    })()

    tablist.addEventListener('click', function (e) {
      let target = searchParentLink(e.target, tablist)

      if (target) {
        if (target.classList.contains('click')) {
          e.preventDefault();
        } else {
          tablist.querySelector('a.click').classList.remove('click')
          target.classList.add('click')
        }
      }
    })

    header.appendChild(tablist)

    let share = document.createElement('a')
    share.className = 'mltdsharebtn'
    share.textContent = i18n.data[langCode].share
    share.href = '#'
    share.addEventListener('click', function (e) {
      e.preventDefault()
      GM.setClipboard(iframe.contentWindow.location.href)
      alert(i18n.data[langCode].linkCopied)
    })
    header.appendChild(share)

    let changeLang = document.createElement('select')
    changeLang.className = 'changelang'
    changeLang.innerHTML = (function () {
      let option = ''
      for (const [lang, name] of Object.entries(i18n.lang)) {
        option += `<option value="${lang}"${(lang === langCode) ? ' selected': ''}>${name}</option>`
      }
      return option
    })()
    changeLang.addEventListener('change', async function () {
      await GM.setValue('lang', this.value)

      langCode = this.value

      browserTitle.textContent = i18n.data[langCode].title
      title.textContent = i18n.data[langCode].title

      for (const tab of tablist.querySelectorAll('a[target=mainFrame]')) {
        tab.innerHTML = `<span class="border"><span>${i18n.data[langCode][tab.dataset.tab]}</span></span>`
      }

      share.textContent = i18n.data[langCode].share
    })
    header.appendChild(changeLang)

    container.appendChild(header)
    container.appendChild(iframe)

    document.body.appendChild(container)
  } else {
    window.addEventListener('mousedown', function (e) {
      let target = searchParentLink(e.target)

      if (target && target.href.indexOf('browser:') === 0) {
        target.setAttribute('target', '_blank')
        target.href = target.href.substring(8)
      }
    })

    let style = document.createElement('style')

    style.textContent = '* { -webkit-user-select: auto !important; }'

    document.head.appendChild(style)
  }
})()
