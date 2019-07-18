// ==UserScript==
// @name MLTD Notice
// @description 밀리시타 공지사항을 이쁘게 보이게 합니다.
// @version 19071803
// @author senior9324
// @run-at document-idle
// @match https://webview-dot-theaterdays.appspot.com/*
// @grant GM_setClipboard
// @grant GM_xmlhttpRequest
// @grant GM.setClipboard
// @grant GM.xmlHttpRequest
// @connect senior9324.github.io
// @require https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @downloadURL https://senior9324.github.io/mltd-notice/mltd.notice.user.js
// ==/UserScript==

(async function() {
  function doXHR(data) {
    if (data.onload || data.onerror) {
      throw new Error('이 함수를 callback 패턴으로 쓰지 마세요.')
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

  async function getMainStylesheet() {

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

  .sharebtn {
    float: right;
    display: inline-block;
    padding: 10px 20px;
    color: black;
    text-decoration: none;
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

    history.replaceState(null, 'お知らせ', '/')

    let browserTitle = document.createElement('title')
    browserTitle.textContent = 'お知らせ'
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
    title.textContent = 'お知らせ'
    header.appendChild(title)

    let tablist = document.createElement('ul')
    tablist.id = 'tablist'
    tablist.innerHTML = '' +
      '<li><a href="/info/google#/update" class="click" target="mainFrame"><span class="border"><span>Update</span></span></a></li>' +
      '<li><a href="/info/google#/event" target="mainFrame"><span class="border"><span>Event</span></span></a></li>' +
      '<li><a href="/info/google#/bug" target="mainFrame"><span class="border"><span>Bug</span></span></a></li>'
    tablist.addEventListener('click', function (e) {
      let target = searchParentLink(e.target, tablist)

      if (target) {
        if (target.className === 'click') {
          e.preventDefault();
        } else {
          tablist.querySelector('a.click').className = ''
          target.className = 'click'
        }
      }
    })

    header.appendChild(tablist)

    let share = document.createElement('a')
    share.className = 'sharebtn'
    share.innerHTML = 'Share'
    share.href = '#'
    share.addEventListener('click', function (e) {
      e.preventDefault()
      GM.setClipboard(iframe.contentWindow.location.href)
      alert('복사가 완료되었습니다.')
    })
    header.appendChild(share)

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
