document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener("map:init", (event) => {
        const map = event.detail.map
        const container = map.getContainer()
        const dataset = container.parentElement.dataset

        L.tileLayer("//tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            className: `leaflet-basemap layer-${getPreferredTheme()}`
        }).addTo(map)
        
        // update container class attribute
        container.className = `${container.className} z-1 ${dataset.mapClass || ''}`
        
        // apply map resize observer
        elementResizeObserver(container, () => map.invalidateSize())
        

        map._initComplete = true
        map.fire('initComplete')
    })
})