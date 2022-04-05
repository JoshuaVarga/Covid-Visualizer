// Portions of this code have been adapted from bumbeishvili/d3js-boilerplates
// found at https://github.com/bumbeishvili/d3js-boilerplates.
// Copyright (c) 2020 David  Bumbeishvili. All rights reserved.
// Use of this source code is governed by a MIT license that can be
// found in the ThirdPartyNotices.txt file.

class Choropleth {
    constructor() {
        const attrs = {
            id: 'ID' + Math.floor(Math.random() * 1000000),
            svgWidth: 500,
            svgHeight: 500,
            marginTop: 5,
            marginRight: 5,
            marginBottom: 5,
            marginLeft: 5,
            container: 'body',
            data: null,
            chartWidth: null,
            chartHeight: null,
            colorScheme: d3.scaleOrdinal(),
            mapper: d3.map()
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

        this.initializeEnterExitUpdatePattern();
    }

    render() {
        this.setDynamicContainer();
        this.calculateProperties();
        this.drawSvgAndWrappers();
        this.drawPaths();

        return this;
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
            id: null,
            chartTopMargin: null,
            chartLeftMargin: null,
            chartWidth: null,
            chartHeight: null
        };
        calc.id = 'ID' + Math.floor(Math.random() * 1000000); // id for event handlings
        calc.chartLeftMargin = marginLeft;
        calc.chartTopMargin = marginTop;
        const chartWidth = svgWidth - marginRight - calc.chartLeftMargin;
        const chartHeight = svgHeight - marginBottom - calc.chartTopMargin;

        this.setState({ calc, chartWidth, chartHeight });
    }

    drawPaths() {
        const {
            chart,
            data,
            chartWidth,
            chartHeight,
            projection,
            colorScheme,
            mapper,
            calc
        } = this.getState();

        chart
            ._add({
                tag: 'path',
                className: 'path',
                data: data,
                exitTransition: function(selection) {
                    selection
                        .attr('d', d3.geoPath()
                            .projection(projection))
                        .transition()
                        .ease(d3.easePoly)
                        .duration(2000)
                        .delay(500)
                        .attr('fill', function(d) { return colorScheme(mapper.get(d.properties.name)) })
                }
            })
            .attr('width', chartWidth)
            .attr('width', chartHeight);

        chart._add({
                tag: 'rect',
                className: 'legend',
                exitTransition: function(selection) {
                    selection
                        .transition()
                        .ease(d3.easePoly)
                        .duration(2000)
                        .delay(500)
                        .attr('fill', 'url(#gradient)')
                }
            })
            .attr('width', 400)
            .attr('height', 20)
            .attr(
                'transform',
                'translate(' + (calc.chartLeftMargin + 50) + ',' + (chartHeight - 100 - calc.chartTopMargin) + ')'
            );
    }

    drawSvgAndWrappers() {
        const {
            svgWidth,
            svgHeight,
            d3Container,
            calc,
            chartWidth,
            chartHeight,
            data,
            colorScheme
        } = this.getState();

        d3.selectAll('defs').remove();
        d3.selectAll('.axis').remove();

        const svg = d3Container
            ._add({
                tag: 'svg',
                className: 'svg-content'
            })
            .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight + '')
            .attr('preserveAspectRatio', 'xMinYMin meet');

        var chart = svg
            ._add({
                tag: 'g',
                className: 'chart'
            })
            .attr(
                'transform',
                'translate(' + calc.chartLeftMargin + ',' + calc.chartTopMargin + ')'
            );

        var projection = d3.geoMercator()
            .center([0, 30])
            .translate([
                (chartWidth / 2),
                (chartHeight / 2)
            ]);

        chart
            ._add({
                tag: 'path',
                className: 'path',
                data: data,
                exitTransition: function(selection) {
                    selection.exit()
                        .transition()
                        .ease(d3.easePoly)
                        .duration(2000)
                        .delay(500)
                        .remove();
                }
            })
            .attr('width', chartWidth)
            .attr('width', chartHeight);

        var gradient = svg.append('defs').append('g')
            .append('linearGradient')
            .attr('id', 'gradient')
            .attr('x1', 0)
            .attr('x2', 1)
            .attr('y1', 0)
            .attr('y2', 0);


        for (let color in colorScheme.range()) {
            gradient.append('stop')
                .attr('offset', parseInt(((color / (colorScheme.range().length - 1) * 100))) + "%")
                .attr('stop-color', colorScheme.range()[color]);
        }

        chart._add({
                tag: 'rect',
                className: 'legend',
                exitTransition: function(selection) {
                    selection.exit()
                        .transition()
                        .ease(d3.easePoly)
                        .duration(2000)
                        .delay(500)
                        .attr('fill', '#ffffff')
                        .remove();
                }
            })
            .attr('width', 400)
            .attr('height', 20)
            .attr(
                'transform',
                'translate(' + (calc.chartLeftMargin + 50) + ',' + (chartHeight - 100 - calc.chartTopMargin) + ')'
            );

        var scale = d3.scaleOrdinal()
            .domain(colorScheme.domain())
            .range([0, 400]);

        svg.append('g')
            .attr('class', 'axis')
            .attr(
                'transform',
                'translate(' + (calc.chartLeftMargin + 55) + ',' + (chartHeight - 75 - calc.chartTopMargin) + ')'
            )
            .call(d3.axisBottom(scale));

        this.setState({ chart, svg, projection });
    }

    initializeEnterExitUpdatePattern() {
        d3.selection.prototype._add = function(params) {
            var container = this;
            var className = params.className;
            var elementTag = params.tag;
            var data = params.data || [className];
            var exitTransition = params.exitTransition || null;
            var enterTransition = params.enterTransition || null;
            // Pattern in action
            var selection = container.selectAll('.' + className).data(data, (d, i) => {
                if (typeof d === 'object') {
                    if (d.id) {
                        return d.id;
                    }
                }
                return i;
            });
            if (exitTransition) {
                exitTransition(selection);
            } else {
                selection.exit().remove();
            }

            const enterSelection = selection.enter().append(elementTag);
            if (enterTransition) {
                enterTransition(enterSelection);
            }
            selection = enterSelection.merge(selection);
            selection.attr('class', className);
            return selection;
        };
    }

    setDynamicContainer() {
        const attrs = this.getState();

        //Drawing containers
        var d3Container = d3.select(attrs.container);
        var containerRect = d3Container.node().getBoundingClientRect();
        if (containerRect.width > 0) attrs.svgWidth = containerRect.width;

        d3.select(window).on('resize.' + attrs.id, function() {
            var containerRect = d3Container.node().getBoundingClientRect();
            if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
            this.calculateProperties();
        }.bind(this));

        this.setState({ d3Container });
    }
}