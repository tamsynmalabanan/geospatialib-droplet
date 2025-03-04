document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener("map:init", (event) => {
        const map = event.detail.map
        const container = map.getContainer()
        const dataset = container.parentElement.dataset

        container.className = `z-1 bg-${getPreferredTheme()} ${container.className} ${dataset.mapClass || ''}`
        addLeafletBasemapLayer(map)
        applyThemeToLeafletControls(container)
        elementResizeObserver(container, () => map.invalidateSize())
        if (dataset.mapPanels === 'true') handleLeafletMapPanels(map)

        map._initComplete = true
        map.fire('initComplete')
    })
})