import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"

import { Button } from "~components/ui/button"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN"
}

const wait = (seconds: number) => {
  const waitTime = seconds * 1000
  return new Promise((resolve) => setTimeout(resolve, waitTime))
}

const loadAllReelRow = () => {
  const reelNextButton = document.querySelector(
    "#right-arrow > ytd-button-renderer"
  ) as HTMLButtonElement
  if (reelNextButton) {
    console.log("Next button existed and clicked")
    reelNextButton.click()
  } else {
    console.log("Next button does not existed")
  }
}


const clearRow = async () => {
  console.log("clearRow")
  const reelOptionButtons = document.querySelectorAll(
    "#items > ytm-shorts-lockup-view-model-v2 > ytm-shorts-lockup-view-model > div > div.shortsLockupViewModelHostOutsideMetadataMenu.shortsLockupViewModelHostShowOverPlayer > button"
  ) as NodeListOf<HTMLButtonElement>

  console.log("reelOptionButtons", reelOptionButtons.length)

  for (let i = 0; i < reelOptionButtons.length - 1; i++) {
    console.log(reelOptionButtons[i])
    console.log(i)
    reelOptionButtons[i].click()
    await wait(1)
    const deleteOption = document.querySelector(
      "#contentWrapper > yt-sheet-view-model > yt-contextual-sheet-layout > div.yt-contextual-sheet-layout-wiz__content-container > yt-list-view-model > yt-list-item-view-model:nth-child(5)"
    ) as HTMLButtonElement
    deleteOption.click()
    await wait(2)
  }
}

const handleClearShorts = () => {
  loadAllReelRow()
  clearRow()
}

/**
 * Generates a style element with adjusted CSS to work correctly within a Shadow DOM.
 *
 * Tailwind CSS relies on `rem` units, which are based on the root font size (typically defined on the <html>
 * or <body> element). However, in a Shadow DOM (as used by Plasmo), there is no native root element, so the
 * rem values would reference the actual page's root font size—often leading to sizing inconsistencies.
 *
 * To address this, we:
 * 1. Replace the `:root` selector with `:host(plasmo-csui)` to properly scope the styles within the Shadow DOM.
 * 2. Convert all `rem` units to pixel values using a fixed base font size, ensuring consistent styling
 *    regardless of the host page's font size.
 */
export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize

    return `${pixelsValue}px`
  })

  const styleElement = document.createElement("style")

  styleElement.textContent = updatedCssText

  return styleElement
}

const PlasmoOverlay = () => {
  return (
    <Button
      className="z-50 flex fixed top-32 right-8 "
      onClick={handleClearShorts}>
      Unshort
    </Button>
  )
}

export default PlasmoOverlay
