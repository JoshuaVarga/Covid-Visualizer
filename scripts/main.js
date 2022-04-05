import * as lil from '/libs/lil-gui.esm.js'

d3.queue()
    .defer(d3.json, '/data/americas.geo.json')
    .defer(d3.csv, '/data/covid-weekly-trends-americas.csv')
    .awaitAll(function(error, files) {
        if (error) {
            console.error('Failed to load one or more files: ' + error);
        } else {
            const gui = new lil.GUI();
            const mapper = d3.map();
            const color = { scheme: 'sequentialBlues' };
            const zoom = d3.zoom();

            zoom.scaleExtent([0.5, 100])
                .on('zoom', zoomed);

            let geoJson = files[0].features;

            let choropleth;

            choropleth = new Choropleth()
                .container('#svg-container')
                .data(geoJson)
                .svgWidth(window.innerWidth)
                .svgHeight(window.innerHeight);

            let data = {
                metric: 'Cases in the last 7 days'
            };

            gui.add(data, 'metric', ['Cases in the last 7 days', 'Cases in the preceding 7 days', 'Weekly Case % Change']).name('Metric');
            gui.add(color, 'scheme', {
                sequentialBlues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
                sequentialReds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
                divergingRdBu: ['#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac'],
                qualitativePaired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c']
            }).name('Color Scale');

            let btnResetZoom = { resetZoom: function() { d3.select('.svg-content').call(zoom.transform, d3.zoomIdentity) } }
            gui.add(btnResetZoom, 'resetZoom');

            gui.onChange(event => {
                update();
            });

            update();
            var svg = d3.selectAll('.svg-content').call(zoom);

            function update() {
                let column = [];

                for (let row in files[1]) {
                    mapper.set(files[1][row]['Country/Other'], +files[1][row][data.metric]);
                    column.push(+files[1][row][data.metric]);
                }

                if (typeof(color.scheme) == 'string') color.scheme = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];
                let colorScale = d3.scaleOrdinal(color.scheme).domain(d3.extent(column));

                choropleth.colorScheme(colorScale)
                    .mapper(mapper)
                    .render();
            }

            function zoomed() {
                const currentTransform = d3.event.transform;
                d3.selectAll('.path').attr('transform', currentTransform);
            }
        }
    });