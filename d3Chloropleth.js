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
            data: [],
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
        this.calculateProperties();
        this.drawSvgAndWrappers();
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
            container,
            svgWidth,
            svgHeight,
            calc,
            data,
            chartWidth,
            chartHeight
        } = this.getState();

        var svg = d3.select(container).append("svg")
            .attr("class", "svg-content")
            .attr("viewBox", [0, 0, svgWidth, svgHeight])
            .attr("preserveAspectRatio", "xMinYMin meet");

        var chart = svg.append("g")
            .attr(
                "transform",
                "translate(" + calc.chartLeftMargin + "," + calc.chartTopMargin + ")"
            );

        chart
            .attr("width", chartWidth)
            .attr("height", chartHeight)

        this.setState({ chart, svg });
    }
}