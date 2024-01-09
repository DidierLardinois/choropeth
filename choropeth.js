// Fetch the education data
fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')
    .then(response => response.json())
    .then(educationData => {
        // Fetch the county data
        fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
            .then(response => response.json())
            .then(countyData => {
                // Create the Chloropeth Map
                const width = 960;
                const height = 1000;

                const svg = d3.select("body")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);

                svg.append("text")
                    .attr("id", "title")
                    .attr("x", width / 2)
                    .attr("y", 25)
                    .attr("text-anchor", "middle")
                    .text("Choropleth Map");

                svg.append("text")
                    .attr("id", "description")
                    .attr("x", width / 2)
                    .attr("y", 40)
                    .attr("text-anchor", "middle")
                    .text("This is a Choropleth Map showing the percentage of adults with a bachelor's degree or higher in each county of the United States.");

                const path = d3.geoPath();

                const colorScale = d3.scaleQuantize()
                    .domain([0, d3.max(educationData, d => d.bachelorsOrHigher)])
                    .range(d3.schemeBlues[5]);
                
                const tooltip = d3.select("body")
                    .append("div")
                    .attr("id", "tooltip");

                svg.append("g")
                    .selectAll("path")
                    .data(topojson.feature(countyData, countyData.objects.counties).features)
                    .enter()
                    .append("path")
                    .attr("class", "county")
                    .attr("data-fips", d => d.id)
                    .attr("data-education", d => {
                        const county = educationData.find(c => c.fips === d.id);
                        return county ? county.bachelorsOrHigher : 0;
                    })
                    .attr("fill", d => {
                        const county = educationData.find(c => c.fips === d.id);
                        return county ? colorScale(county.bachelorsOrHigher) : colorScale(0);
                    })
                    .attr("d", path)
                    .on("mouseover", (event, d) => {
                        const county = educationData.find(c => c.fips === d.id);
                        tooltip.attr("data-education", county ? county.bachelorsOrHigher : 0)
                            .style("opacity", 0.9)
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .html(county ? county.area_name + ", " + county.state + ": " + county.bachelorsOrHigher + "%" : "No data");
                    })
                    .on("mouseout", () => {
                        tooltip.style("opacity", 0);
                    });

                const legend = svg.append("g")
                    .attr("id", "legend");

                const legendWidth = 250;
                const legendHeight = 10;

                const legendScale = d3.scaleLinear()
                    .domain([0, d3.max(educationData, d => d.bachelorsOrHigher)])
                    .range([0, legendWidth]);

                const legendAxis = d3.axisBottom(legendScale)
                    .tickSize(legendHeight)
                    .tickFormat(d => d + "%");

                legend.append("g")
                    .call(legendAxis);

                legend.selectAll("rect")
                    .data(colorScale.range().map(d => colorScale.invertExtent(d)))
                    .enter()
                    .append("rect")
                    .attr("x", d => legendScale(d[0]))
                    .attr("y", 0)
                    .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
                    .attr("height", legendHeight)
                    .attr("fill", d => colorScale(d[0]));
            });
    });
