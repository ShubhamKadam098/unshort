import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState } from "react"

import { Button } from "~components/ui/button"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN"
}

const wait = (seconds: number) => {
  const waitTime = seconds * 1000
  return new Promise((resolve) => setTimeout(resolve, waitTime))
}

const logCurrentTime = (prfix?: string) => {
  // log current time
  const currentTime = new Date().getTime()
  console.log(prfix ? prfix : "currentTime", currentTime)
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
  const [isProcessing, setIsProcessing] = useState(false)
  const isProcessingRef = useRef(isProcessing)

  const startProcessing = () => {
    isProcessingRef.current = true
    setIsProcessing(true)
  }

  const stopProcessing = () => {
    isProcessingRef.current = false
    setIsProcessing(false)
  }

  function isElementVisible(element) {
    const style = window.getComputedStyle(element)
    const opacity = parseFloat(style.opacity) // Convert to a number

    return opacity > 0 // Returns true if opacity is greater than 0
  }

  // This function helps to load all the shorts
  const loadAllShortsRow = async (shortList: Element) => {
    let nextButtonClicks = 0
    while (isProcessingRef.current) {
      const reelNextButton = shortList.querySelector(
        "#right-arrow > ytd-button-renderer"
      ) as HTMLButtonElement
      if (isElementVisible(reelNextButton)) {
        console.log(
          "Next button exist " +
            nextButtonClicks +
            " clicks which is " +
            reelNextButton
        )
        nextButtonClicks++
        reelNextButton.click()
        await wait(1)
      } else {
        console.log(
          "Next button does not existed for " +
            shortList +
            " after " +
            nextButtonClicks +
            " clicks"
        )
        break
      }
    }
  }

  // This function helps to delete a short using the option button
  const deleteShort = async (shortOptionButton: HTMLButtonElement) => {
    console.log("Delete short shortOptionButton", shortOptionButton)
    shortOptionButton.click()

    await wait(1)
    const deleteOption = document.querySelector(
      "#contentWrapper > yt-sheet-view-model > yt-contextual-sheet-layout > div.yt-contextual-sheet-layout-wiz__content-container > yt-list-view-model > yt-list-item-view-model:nth-child(5)"
    ) as HTMLButtonElement
    if (!deleteOption) {
      console.log("deleteOption not found")
      return
    } else {
      console.log("deleteOption found", deleteOption)
      deleteOption.click()
    }
  }

  const clearShortsRow = async (shortList: Element) => {
    // select all the option buttons for shorts from the row
    const shortOptionButtons = shortList.querySelectorAll<HTMLButtonElement>(
      "div.shortsLockupViewModelHostOutsideMetadataMenu.shortsLockupViewModelHostShowOverPlayer > button"
    )
    console.log("shortOptionButtons", shortOptionButtons)

    for (
      let i = 0;
      i < shortOptionButtons.length - 1 && isProcessingRef.current;
      i++
    ) {
      await deleteShort(shortOptionButtons[i])
    }
  }

  const handleClearShorts = async () => {
    let proccessedRows = 0
    let scrolls = 0
    console.log("initial isProcessing", isProcessingRef.current)
    while (isProcessingRef.current) {
      if (scrolls > 10) {
        console.log("Scrolled 10 times, stopping")
        break
      }
      const shortsLists = document.querySelectorAll("ytd-reel-shelf-renderer")
      console.log("shortList", shortsLists)
      if (proccessedRows < shortsLists.length) {
        console.log("resetting scrolls")
        scrolls = 0
        const currentRow = proccessedRows
        console.log("Current row number", currentRow)
        shortsLists[currentRow].scrollIntoView({ behavior: "smooth" })
        await loadAllShortsRow(shortsLists[currentRow])
        await clearShortsRow(shortsLists[currentRow])
        proccessedRows++
      } else {
        scrolls++
        console.log("Scrolling to bottom")
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth"
        })
        // log current time
        logCurrentTime()
        await wait(5)
        // log current time again
        logCurrentTime()
      }
    }
  }

  const handleButtonClick = async () => {
    startProcessing()
    await handleClearShorts()
    stopProcessing()
  }

  useEffect(() => {
    console.log("isProcessingRef", isProcessingRef)
  }, [isProcessingRef])

  return (
    <div className="z-50 flex fixed top-32 right-8">
      {isProcessing ? (
        <Button onClick={stopProcessing}>Stop</Button>
      ) : (
        <Button onClick={handleButtonClick}>Unshort</Button>
      )}
    </div>
  )
}

export default PlasmoOverlay
