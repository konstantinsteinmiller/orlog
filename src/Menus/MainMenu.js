import EventEmitter from '@/Utils/EventEmitter.js'
import { getStorage, setStorage } from '@/Utils/storage.js'
import { GAME_SOUND_EFFECT_VOLUME } from '@/Utils/constants.js'

export default class MainMenu extends EventEmitter {
  constructor(isLoadingPhysics) {
    super()
    this.$menuWrapper = document.querySelector('.menu-wrapper')
    this.$menu = document.querySelector('.menu-list')
    this.$startButton = document.querySelector('.menu-list-item:first-child')
    this.$joinButton = document.querySelector('.menu-list-item.menu-list__multiplayer')
    this.$optionsButton = document.querySelector('.menu-list-item.menu-list__options')
    this.$audioButton = document.querySelector('.menu-list-item.menu-list__audio')
    this.$menuLists = document.querySelectorAll('.menu-list')
    this.$mainMenu = document.querySelector('.menu-list.menu-list__main-menu')
    this.$optionsMenu = document.querySelector('.menu-list.menu-list__options-menu')
    this.$audioMenu = document.querySelector('.menu-list.menu-list__options-menu-audio')
    this.$backButtonOptions = document.querySelector('.menu-list__options-menu .menu-list__back-button')
    this.$backButtonAudio = document.querySelector('.menu-list__options-menu-audio .menu-list__back-button')

    this.items = document.querySelectorAll('.menu-list-item')
    this.w = document.querySelector('.ogame').clientWidth //window width
    this.h = document.querySelector('.ogame').clientHeight //window height
    this.offsetX = 0
    this.$componentName = null

    this.addLoader(isLoadingPhysics)
    this.setSoundEffectVolume()

    this.$menuWrapper.addEventListener('mousemove', (e) => this.onMouseMove(e))
    this.$startButton.addEventListener('click', (e) => this.onStartClick(e))
    this.$joinButton.addEventListener('click', (e) => this.onJoinMultiplayerClick(e))
    this.$optionsButton.addEventListener('click', (e) => this.onOptionsClick(e))
    this.$audioButton.addEventListener('click', (e) => this.onAudioClick(e))
    this.$backButtonOptions.addEventListener('click', (e) => this.onBackToMainClick(e))
    this.$backButtonAudio.addEventListener('click', (e) => this.onBackToOptionsClick(e))
    backToMenuButton.addEventListener('click', (e) => this.toggleLeaveConsentModal(e))
    doLeaveGameId.addEventListener('click', (e) => this.onBackToMainClick(e, true))
  }

  onMouseMove(e) {
    const offsetX = 0.5 - e.pageX / this.w //cursor position X
    const offsetY = 0.5 - e.pageY / this.h //cursor position Y
    const dy = e.pageY - this.h / 2 //@h/2 = center of poster
    const dx = e.pageX - this.w / 2 //@w/2 = center of poster
    const theta = Math.atan2(dy, dx) //angle between cursor and center of poster in RAD
    let angle = (theta * 180) / Math.PI - 90 //convert rad in degrees
    const offsetPoster = this.$menu.dataset.offset
    const transformPoster = `translate(-50%, -50%) translate3d(0, ${-offsetX * offsetPoster}px, 0) rotateX(${
      -offsetY * offsetPoster
    }deg) rotateY(${offsetX * (offsetPoster * 2)}deg)` //poster transform

    //get angle between 0-360
    if (angle < 0) {
      angle = angle + 360
    }

    //poster transform
    this.$menu.style.transform = transformPoster

    //parallax for each layer
    Array.prototype.forEach.call(this.items, (node) => {
      const offsetLayer = node.dataset.offset || 0
      const transformLayer = `translate3d(${offsetX * offsetLayer}px, ${offsetY * offsetLayer}px, 20px)`
      node.style.transform = transformLayer
    })
  }

  addLoader(isLoadingPhysics) {
    const triangle = document.createElement('div')
    triangle.classList.add('triangle')
    const square = document.createElement('div')
    square.classList.add('square')
    for (let i = 1; i < 121; i++) {
      triangle.appendChild(square.cloneNode())
    }

    const loadingText = document.createElement('div')
    loadingText.appendChild(document.createTextNode('Loading '))
    const componentName = document.createElement('span')
    componentName.appendChild(document.createTextNode('physics'))
    componentName.classList.add('loading-text__component-name')
    const dot = document.createElement('span')
    dot.appendChild(document.createTextNode('.'))
    dot.classList.add('dot')
    loadingText.appendChild(componentName)
    loadingText.appendChild(dot.cloneNode(true))
    loadingText.appendChild(dot.cloneNode(true))
    loadingText.appendChild(dot.cloneNode(true))
    loadingText.classList.add('loading-text')
    loadingText.classList.add('selection--disabled')

    loadingTriangleId.appendChild(triangle)
    loadingTriangleId.appendChild(loadingText)
    this.loadingText = loadingText
  }

  updateLoaderComponentName(name) {
    this.$componentName = document.querySelector('.loading-text__component-name')
    this.$componentName.innerText = name
  }

  removeLoader() {
    this.loadingText.innerText = ''
  }

  onStartClick() {
    backToMenuButton.style.display = 'block'
    this.trigger('start-game')
  }

  onJoinMultiplayerClick() {
    backToMenuButton.style.display = 'block'
    this.trigger('join-multiplayer-game')
  }

  onOptionsClick() {
    Array.prototype.forEach.call(this.$menuLists, (menu) => {
      menu.style.display = 'none'
    })
    this.$optionsMenu.style.display = 'flex'
  }

  onAudioClick() {
    Array.prototype.forEach.call(this.$menuLists, (menu) => {
      menu.style.display = 'none'
    })
    this.$audioMenu.style.display = 'flex'
  }

  toggleLeaveConsentModal() {
    leaveConsentModal.click()
  }

  onBackToMainClick(event, isFromGame) {
    if (isFromGame) {
      mainMenuId.style.display = 'block'
      backToMenuButton.style.display = 'none'
    }
    Array.prototype.forEach.call(this.$menuLists, (menu) => {
      menu.style.display = 'none'
    })
    this.$mainMenu.style.display = 'flex'
  }

  onBackToOptionsClick() {
    Array.prototype.forEach.call(this.$menuLists, (menu) => {
      menu.style.display = 'none'
    })
    this.$optionsMenu.style.display = 'flex'
  }

  setBackgroundMusic() {
    let hidden
    let visibilityChange
    if (typeof document.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden'
      visibilityChange = 'visibilitychange'
    } else if (typeof document.msHidden !== 'undefined') {
      hidden = 'msHidden'
      visibilityChange = 'msvisibilitychange'
    } else if (typeof document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden'
      visibilityChange = 'webkitvisibilitychange'
    }

    // If the page is hidden, pause the video;
    // if the page is shown, play the video
    function handleVisibilityChange() {
      if (document[hidden]) {
        backgroundMusicId.pause()
      } else {
        backgroundMusicId.play()
      }
    }

    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === 'undefined' || hidden === undefined) {
      console.log(
        'This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.',
      )
    } else {
      // Handle page visibility change
      document.addEventListener(visibilityChange, handleVisibilityChange, false)

      // When the video pauses, set the title.
      // This shows the paused
      backgroundMusicId.addEventListener(
        'pause',
        () => {
          document.title = 'ToF Paused'
        },
        false,
      )

      // When the video plays, set the title.
      backgroundMusicId.addEventListener(
        'play',
        () => {
          document.title = 'TrialsOfFaith'
        },
        false,
      )
    }
  }

  setSoundEffectVolume() {
    this.soundEffectsVolume = parseFloat(getStorage(GAME_SOUND_EFFECT_VOLUME, true)) ?? 1.0
    soundEffectsVolumeId.value = this.soundEffectsVolume
    soundEffectsVolumeId.onchange = (value) => {
      this.soundEffectsVolume = parseFloat(value.target.value)
      setStorage(GAME_SOUND_EFFECT_VOLUME, soundEffectsVolumeId.value, true)
    }
  }
}
