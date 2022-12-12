function drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

(() => {
  fetch("/js/expertise.json")
    .then((response) => response.json())
    .then((data) => {
      const width = 320;
      const height = width; // 1:1 aspect ratio

      const expertiseNetwork = d3
        .select("#expertise-network-container")
        .append("svg")
        .attr("id", "expertise-network")
        .attr("width", width)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

      const centerForce = d3.forceCenter();
      const nodeForce = d3.forceManyBody().strength(-200);
      const linkForce = d3
        .forceLink(data.links)
        .id((d) => d.id)
        .strength(1);

      const simulation = d3
        .forceSimulation(data.nodes)
        .force("center", centerForce)
        .force("charge", nodeForce)
        .force("link", linkForce);

      const link = expertiseNetwork
        .append("g")
        .attr("id", "links")
        .selectAll("line")
        .data(data.links)
        .join("line");

      // Create connection set
      const connections = new Set();
      data.links.forEach((l) => {
        connections.add(l.source.id + "," + l.target.id);
      });

      const node = expertiseNetwork
        .append("g")
        .attr("id", "nodes")
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .call(drag(simulation))
        .on("mouseover", (event, hoveredNode) => {
          expertiseNetwork.classed("hovered", true);
          node
            .filter((n) => {
              return (
                connections.has(hoveredNode.id + "," + n.id) ||
                connections.has(n.id + "," + hoveredNode.id) ||
                n.id == hoveredNode.id
              );
            })
            .classed("active", true);

          label
            .filter((l) => {
              return (
                connections.has(hoveredNode.id + "," + l.id) ||
                connections.has(l.id + "," + hoveredNode.id) ||
                l.id == hoveredNode.id
              );
            })
            .classed("active", true);

          link
            .filter((l) => {
              return (
                hoveredNode.id == l.source.id || hoveredNode.id == l.target.id
              );
            })
            .classed("active", true);
        })
        .on("mouseout", () => {
          expertiseNetwork.classed("hovered", false);
          node.classed("active", false);
          link.classed("active", false);
          label.classed("active", false);
        });

      const label = expertiseNetwork
        .append("g")
        .attr("id", "labels")
        .selectAll(".label")
        .data(data.nodes)
        .enter()
        .append("g")
        .classed("label", true);

      label
        .append("text")
        .classed("circleText", true)
        .attr("dx", 0)
        .attr("dy", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "0.5em")
        .text((d) => d.name);

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        label.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
      });
    });
})();
