// Portions of this code have been adapted from bumbeishvili/d3js-boilerplates
// found at https://github.com/bumbeishvili/d3js-boilerplates.
// Copyright (c) 2020 David  Bumbeishvili. All rights reserved.
// Use of this source code is governed by a MIT license that can be
// found in the ThirdPartyNotices.txt file.

class Chart {
    constructor() {
        const attrs = {
            svgWidth: 500,
            svgHeight: 500,
            marginTop: 5,
            marginRight: 5,
            marginBottom: 5,
            marginLeft: 5,
            container: 'body',
            data: null,
            chartWidth: null,
            chartHeight: null
        };

        this.getState = () => attrs;
        this.setState = (d) => Object.assign(attrs, d);

        Object.keys(attrs).forEach((key) => {
            //@ts-ignore
            this[key] = function(_) {
                if (!arguments.length) {
                    return attrs[key];
                }
                attrs[key] = _;
                return this;
            };
        });
    }

    render() {
        const { data } = this.getState();
        console.log(data[1]);
        this.calculateProperties();
        this.initZoom();
        this.drawSvgAndWrappers();
        this.drawTopo();
        return this;
    }

    initZoom() {
        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .on("zoom", this.zoomed);

        this.setState({ zoom });
    }

    calculateProperties() {
        const {
            svgWidth,
            svgHeight,
            marginTop,
            marginRight,
            marginBottom,
            marginLeft,
        } = this.getState();

        var calc = {
            chartTopMargin: null,
            chartLeftMargin: null,
            chartWidth: null,
            chartHeight: null
        };
        calc.chartLeftMargin = marginLeft;
        calc.chartTopMargin = marginTop;
        const chartWidth = svgWidth - marginRight - calc.chartLeftMargin;
        const chartHeight = svgHeight - marginBottom - calc.chartTopMargin;

        this.setState({ calc, chartWidth, chartHeight });
    }

    drawSvgAndWrappers() {
        const {
            svgWidth,
            svgHeight,
            container,
            zoom
        } = this.getState();

        const svg = d3.select(container).append("svg")
            .attr("id", "svg-content")
            .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight + "")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .call(zoom);

        var chart = svg.append("g")
            .attr("id", "chart");

        this.setState({ chart, svg });
    }

    drawTopo() {
        const {
            chart,
            data,
            chartWidth,
            chartHeight,
            calc
        } = this.getState();

        var projection = d3.geoMercator()
            .scale(150)
            .center([-100, 50])
            .translate([
                (chartWidth / 2) + calc.chartLeftMargin,
                (chartHeight / 2) + calc.chartTopMargin
            ]);

        chart.selectAll("path")
            .data(data[0].features)
            .enter()
            .append("path")
            .attr("d", d3.geoPath()
                .projection(projection)
            );
    }

    zoomed() {
        const currentTransform = d3.event.transform;
        d3.selectAll("g#chart").attr("transform", currentTransform);
    }
}