/** @type WeakSet<Node> */
const videos = new WeakSet()

const observer = new MutationObserver(callback)
observer.observe(document.body, { childList: true, subtree: true })

/** @type MutationCallback */
function callback(mutationsList) {
  mutationsList.forEach((mutation) => {
    if (mutation.type === 'childList') {
      for (let node of mutation.addedNodes) {
        if (node.nodeName === 'VIDEO' && !videos.has(node)) {
          videos.add(node)
          processVideoNode(node)
        }
      }
    }
  })
}

/** @param {Event} e */
function fullscreenize(e) {
  assertInstance(e.currentTarget, HTMLVideoElement).requestFullscreen()
}

/** @param {Node} el */
function processVideoNode(el) {
  const asserted = assertInstance(el, HTMLVideoElement)
  asserted.addEventListener('dblclick', fullscreenize)
}

function allVideos() {
  return document.querySelectorAll('video')
}

document.addEventListener('keydown', (down) => {
  if (down.key !== 'Shift') {
    return
  }
  const vids = allVideos()
  vids.forEach((video) => {
    const pointerEvents = video.style.getPropertyValue('pointer-events')
    const zIndex = video.style.getPropertyValue('z-index')
    if (pointerEvents) {
      video.style.setProperty('--__pointer-events', pointerEvents)
    }
    if (zIndex) {
      video.style.setProperty('--__z-index', zIndex)
    }
    video.style.setProperty('pointer-events', 'all')
    video.style.setProperty('z-index', '9999999999')
  })
  /** @param {KeyboardEvent} up */
  const upListener = (up) => {
    if (up.key !== down.key) {
      return
    }
    vids.forEach((video) => {
      const pointerEvents = video.style.getPropertyValue('--__pointer-events')
      const zIndex = video.style.getPropertyValue('--__z-index')
      if (pointerEvents) {
        video.style.setProperty('pointer-events', pointerEvents)
        video.style.removeProperty('--__pointer-events')
      } else {
        video.style.removeProperty('pointer-events')
      }
      if (zIndex) {
        video.style.setProperty('z-index', zIndex)
        video.style.removeProperty('--__z-index')
      } else {
        video.style.removeProperty('z-index')
      }
    })
    document.removeEventListener('keyup', upListener)
  }
  document.addEventListener('keyup', upListener)
})

/**
 * @template T
 * @returns {T}
 * @param {unknown} obj
 * @param {new (data: any) => T} type
 */
function assertInstance(obj, type) {
  if (obj instanceof type) {
    /** @type {any} */
    const any = obj
    /** @type {T} */
    const t = any
    return t
  }
  throw new Error(`Object ${obj} does not have the right type '${type}'!`)
}
