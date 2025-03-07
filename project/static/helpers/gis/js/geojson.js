const createGeoJSONChecklist = (geojsonList) => {
    const container = document.createElement('div')
    console.log(geojsonList)

    return container
}

const createPointCoordinatesTable = (ptFeature, {precision = 6}={}) => {
    const table = document.createElement('table')
    table.className = `table table-borderless table-${getPreferredTheme()} table-sm m-0 p-0`

    const tbody = document.createElement('tbody')
    table.appendChild(tbody)

    const [lng, lat] = ptFeature.geometry.coordinates
    const coords = {
        'Longitude': lng,
        'Latitude': lat,
    }    

    const headTr = document.createElement('tr')
    tbody.appendChild(headTr)
    for (const coord in coords) {
        const th = document.createElement('th')
        th.className = 'text-center'
        th.setAttribute('scope','col')
        th.innerText = coord
        headTr.appendChild(th)
    }
    
    const valueTr = document.createElement('tr')
    tbody.appendChild(valueTr)
    for (const coord in coords) {
        const td = document.createElement('td')
        td.className = 'text-center'
        td.innerText = coords[coord].toFixed(precision)
        valueTr.appendChild(td)
    }

    return table
}