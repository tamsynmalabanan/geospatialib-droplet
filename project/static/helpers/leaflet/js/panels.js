const handleLeafletQueryPanel = (map, parent) => {
    const container = document.createElement('div')
    container.className = 'd-flex flex-column'
    parent.appendChild(container)

    const toolbar = document.createElement('div')
    container.appendChild(toolbar)

    const defaultBtnClassName = `btn btn-${getPreferredTheme()}`

    const queryLocationBtn = document.createElement('button')
    queryLocationBtn.className = defaultBtnClassName
    createIcon({className:'bi bi-geo-alt-fill', parent:queryLocationBtn})
    toolbar.appendChild(queryLocationBtn)

    const results = document.createElement('div')
    container.appendChild(results)
}

const handleLeafletMapPanels = (map) => {
    const topRightControlCorner = map._controlCorners.topright
    topRightControlCorner.classList.add('vh-100', 'd-flex')

    const control = L.control({position:'topright'})
    control.onAdd = (map) => {
        const panel = L.DomUtil.create('div', 'map-panel')
        panel.classList.add('d-flex', 'flex-column', 'ms-60', 'mb-70')
        panel.style.maxHeight = '100%'
        
        const [toggle, body] = createMapPanels(map.getContainer())
        panel.appendChild(toggle)
        panel.appendChild(body)
        
        return panel
    }
    
    const panelContainer = control.addTo(map).getContainer()
    console.log(panelContainer)
    console.log(`#${map.getContainer().id}-panels-accordion-query accordion-body`)
    console.log(panelContainer.querySelector(`#${map.getContainer().id}-panels-accordion-query accordion-body`))
    handleLeafletQueryPanel(map, panelContainer.querySelector(`#${map.getContainer().id}-panels-accordion-query accordion-body`))
}
