const handleLeafletQueryPanel = (map, parent) => {
    const mapContainer = map.getContainer()
    
    const toolbar = document.createElement('div')
    toolbar.id = `${mapContainer.id}-panels-query-toolbar`
    toolbar.className = 'd-flex px-3 py-2 border-bottom'
    parent.appendChild(toolbar)

    const results = document.createElement('div')
    parent.appendChild(results)

    const queryTools = {
        locationCoords: {
            iconClass: 'bi-geo-alt-fill',
            title: 'Query location coordinates',
            mapCursor: 'pointer',
            mapClickHandler: async (e) => {
                return {'Clicked location': turf.featureCollection([turf.point([e.latlng.lng, e.latlng.lat])])}
            }
        },
        osmPoint: {
            iconClass: 'bi-pin-map-fill',
            title: 'Query OSM at point',
            mapCursor: 'pointer',
        },
        osmView: {
            iconClass: 'bi-bounding-box-circles',
            title: 'Query OSM in map view',
            btnclickHandler: async (e) => {
                e.target.click()
            }
        },
        layerPoint: {
            iconClass: 'bi-stack',
            title: 'Query layers at point',
            mapCursor: 'pointer',
        },
        divider: {
            tag: 'div',
            className: 'vr m-2',
        },
        cancel: {
            iconClass: 'bi-arrow-counterclockwise',
            title: 'Cancel ongoing query',
            disabled: true,
        },
        clear: {
            iconClass: 'bi-trash-fill',
            title: 'Clear query results',
            disabled: true,
            btnclickHandler: async (e) => {
                results.innerHTML = ''
                e.target.click()
                toolbar.querySelector(`#${toolbar.id}-clear`).disabled = true
            }
        },
    }

    const queryHandler = async (e, handler) => {
        const cancelBtn = toolbar.querySelector(`#${toolbar.id}-cancel`)
        cancelBtn.disabled = false
        const geojsons = await handler(e)
        cancelBtn.disabled = true

        if (!geojsons) return
        const customEvent = new CustomEvent('newQueryResult', {detail: {geojsons}})
        map.fire(customEvent.type, customEvent.detail)
    }
    
    map.on('newQueryResult', (e) => {
        const geojsons = e.geojsons
        results.innerHTML = ''
        if (Object.values(geojsons).some(g => g.features?.length > 0)) {
            results.appendChild(createGeoJSONChecklist(geojsons))
            toolbar.querySelector(`#${toolbar.id}-clear`).disabled = false
        } else {
            alert('No features queried.')
        }
    })

    Object.keys(queryTools).forEach(tool => {
        const data = queryTools[tool]
        toolbar.appendChild(
            !data.tag || data.tag === 'button' ? 
            createButton({...data, ...{
                id: `${toolbar.id}-${tool}`,
                className:`btn-sm btn-${getPreferredTheme()}`,
                clichHandler: async (event) => {
                    L.DomEvent.stopPropagation(event);
                    L.DomEvent.preventDefault(event);        
                    
                    const btn = event.target
                    const queryMode = map._queryMode
                    const activate = queryMode !== tool
                    
                    if (activate && queryMode) toolbar.querySelector(`#${toolbar.id}-${queryMode}`).click()
                    Array(`btn-${getPreferredTheme()}`, 'btn-primary').forEach(className => btn.classList.toggle(className))
                    mapContainer.style.cursor = activate ? data.mapCursor || '' : ''

                    map._queryMode = activate ? tool : undefined
                    if (activate && data.mapClickHandler) {
                        const clickQueryHandler = async (e) => {
                            if (e.originalEvent.target !== mapContainer) return
                            await queryHandler(e, data.mapClickHandler)
                        } 
                        map.on('click', clickQueryHandler)
                    } else {
                        map._events.click = map._events.click.filter(handler => handler.fn.name !== 'clickQueryHandler')
                    }

                    if (activate && data.btnclickHandler) {
                        await queryHandler(event, data.btnclickHandler)
                    }
                }
            }}) :
            customCreateElement(data.tag, data)
        )
    })
}

const handleLeafletMapPanels = (map) => {
    const control = L.control({position:'topright'})
    control.onAdd = (map) => {
        const panel = L.DomUtil.create('div', 'map-panel')
        panel.classList.add('d-flex', 'flex-column')
        
        const [toggle, body] = createMapPanels(map.getContainer())
        panel.appendChild(toggle)
        panel.appendChild(body)
        handleLeafletQueryPanel(map, body.querySelector(`#${body.id}-accordion-query .accordion-body`))
        
        return panel
    }
    
    control.addTo(map)
}
