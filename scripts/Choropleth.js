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
            mapper
        } = this.getState();

        chart
            ._add({
                tag: 'path',
                className: 'path',
                data: data,
                exitTransition: function(selection) {
                    selection
                        .attr('width', chartWidth)
                        .attr('height', chartHeight)
                        .attr('d', d3.geoPath()
                            .projection(projection))
                        .transition()
                        .ease(d3.easePoly)
                        .duration(2000)
                        .delay(500)
                        .attr('fill', function(d) { return colorScheme(mapper.get(d.properties.name)) })
                }
            });
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
            colorScheme,
            mapper
        } = this.getState();

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
            });

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