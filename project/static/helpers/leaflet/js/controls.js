const handleLeafletZoombar = (map, include=true) => {
    if (!include) return map.removeControl(map.zoomControl)

    const container = map.zoomControl.getContainer()
    container.classList.add('border-0', 'shadow-lg')

    const defaultClass = ['border-0', 'd-flex', 'justify-content-center', 'align-items-center']
    const buttonClass = {
        _zoomInButton: {
            icon: createIcon({className: 'bi bi-plus'}),
            class: defaultClass.concat(['rounded-top', 'rounded-bottom-0'])
        },
        _zoomOutButton: {
            icon: createIcon({className: 'bi bi-dash'}),
            class: defaultClass.concat(['rounded-bottom', 'rounded-top-0'])
        },
    }

    for (const buttonName in buttonClass) {
        const properties = buttonClass[buttonName]
        const button = map.zoomControl[buttonName]
        button.innerHTML = properties.icon.outerHTML
        button.classList.add(...properties.class)
    }
}

const handleLeafletScaleBar = (map, include=true) => {
    if (!include) return

    L.control.scale({ position: 'bottomright' }).addTo(map)
}

const handleLeafletSearchBar = (map, include=true) => {
    if (!include || !L.Control.geocoder) return

    const geocoder = L.Control.geocoder({
        defaultMarkGeocode: false,
        position: 'topleft',
    })
    .on('markgeocode', (e) => {
        var bbox = e.geocode.bbox;
        var poly = L.polygon([
            bbox.getSouthEast(),
            bbox.getNorthEast(),
            bbox.getNorthWest(),
            bbox.getSouthWest()
        ]);
        map.fitBounds(poly.getBounds());
    })
    .addTo(map);

    const geocoderContainer = geocoder.getContainer()
    const topLeftContainer = map._controlCorners.topleft
    if (topLeftContainer.firstChild !== geocoderContainer) {
        topLeftContainer.insertBefore(geocoderContainer, topLeftContainer.firstChild);
    }

    const button = geocoderContainer.querySelector('button')
    button.innerText = ''
    button.innerHTML = createIcon({className: 'bi bi-binoculars-fill'}).outerHTML

    const alternativesList = geocoderContainer.querySelector('.leaflet-control-geocoder-alternatives')
    alternativesList.classList.add('list-unstyled', 'px-2')

    const geocoderFieldsSelector = map.getContainer().parentElement.dataset.mapGeocoderFields
    if (geocoderFieldsSelector) {
        document.addEventListener('change', (event) => {
            if (!event.target.matches(geocoderFieldsSelector)) return

            const place = event.target.value
            if (place === '') return
         
            geocoder.setQuery(place)
            geocoder._geocode()
        })
        
        geocoder.on('markgeocode', (e) => {
            const geocoderFields = document.querySelectorAll(geocoderFieldsSelector)
            geocoderFields.forEach(field => {
                if (field.value.toLowerCase() === e.target._lastGeocode.toLowerCase()) {
                    field.value = e.geocode.name
                }
            })
        })
    }
}

const leafletControls = {
    zoom: handleLeafletZoombar,
    scale: handleLeafletScaleBar,
    search: handleLeafletSearchBar,
}


const handleLeafletMapControls = (map) => {
    const container = map.getContainer()
    const dataset = container.parentElement.dataset
    const includedControls = dataset.mapControlsIncluded
    const excludedControls = dataset.mapControlsExcluded

    Object.keys(leafletControls).forEach(controlName => {
        const excluded = excludedControls && (excludedControls.includes(controlName) || excludedControls === 'all')
        const included = !includedControls || includedControls.includes(controlName) || includedControls === 'all'
        leafletControls[controlName](map, included && !excluded)
    })

    applyThemeToLeafletControls(container)
    toggleMapInteractivity(map)
}

const applyThemeToLeafletControls = (container) => {
    // addClassListToSelection(
    //     container, 
    //     removeWhitespace(`
    //         .leaflet-bar a, 
    //         .leaflet-control a, 
    //         .leaflet-control-attribution,
    //         .leaflet-control-scale-line,
    //         .leaflet-control-geocoder,
    //     `).trim(), 
    //     [`text-bg-${getPreferredTheme()}`, 'text-reset']
    // )

    container.querySelectorAll('.leaflet-control').forEach(control => {
        Array.from(control.children).forEach(child => child.classList.add(`text-bg-${getPreferredTheme()}`, 'text-reset'))
    })
}

const toggleMapInteractivity = (map) => {
    map.getContainer().querySelectorAll('.leaflet-control').forEach(control => {
        Array.from(control.children).forEach(child => {
            Array('mouseover', 'touchstart', 'touchmove', 'wheel').forEach(trigger => {
                child.addEventListener(trigger, (e) => {
                    disableMapInteractivity(map)
                })
            })    
    
            Array('mouseout', 'touchend').forEach(trigger => {
                child.addEventListener(trigger, (e) => {
                    enableMapInteractivity(map)
                })
            })
        })
    })
}