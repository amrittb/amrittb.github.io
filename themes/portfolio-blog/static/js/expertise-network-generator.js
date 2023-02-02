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
      const width = 480;
      const height = width; // 1:1 aspect ratio

      const expertiseNetwork = d3
        .select("#expertise-network-container")
        .append("svg")
        .attr("id", "expertise-network")
        .attr("width", width)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

      const centerForce = d3.forceCenter();
      const nodeForce = d3.forceManyBody().strength(-250);
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

      const sourceToTargetMap = new Map();
      const targetToSourceMap = new Map();

      // Source -> Target map
      // Target -> Source map
      data.links.forEach((l) => {
        if (!sourceToTargetMap.has(l.source.id)) {
          sourceToTargetMap.set(l.source.id, new Set());
        }

        if (!targetToSourceMap.has(l.target.id)) {
          targetToSourceMap.set(l.target.id, new Set());
        }

        sourceToTargetMap.get(l.source.id).add(l.target.id);
        targetToSourceMap.get(l.target.id).add(l.source.id);
      });

      const node = expertiseNetwork
        .append("g")
        .attr("id", "nodes")
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", (n) => {
          const minSize = 8;
          const weightMultiplier = 0.5;

          var weight = 0;
          if (sourceToTargetMap.has(n.id)) {
            weight += sourceToTargetMap.get(n.id).size;
          }

          if (targetToSourceMap.has(n.id)) {
            weight += targetToSourceMap.get(n.id).size;
          }

          return minSize + weight * weightMultiplier;
        })
        .attr("class", (n) => {
          // Add class based on node type for styling
          return n.type;
        })
        .call(drag(simulation))
        .on("mouseover", (event, hoveredNode) => {
          expertiseNetwork.classed("hovered", true);

          var activeNodes = new Set();
          // Hovered node also should be active
          activeNodes.add(hoveredNode.id);

          // Add the children of this hovered node as active nodes
          if (sourceToTargetMap.has(hoveredNode.id)) {
            activeNodes = new Set([
              ...activeNodes,
              ...sourceToTargetMap.get(hoveredNode.id),
            ]);
          }

          // Add the parent of this hovered node as active nodes
          if (targetToSourceMap.has(hoveredNode.id)) {
            activeNodes = new Set([
              ...activeNodes,
              ...targetToSourceMap.get(hoveredNode.id),
            ]);
          }

          node
            .filter((n) => {
              return activeNodes.has(n.id);
            })
            .classed("active", true);

          label
            .filter((l) => {
              return activeNodes.has(l.id);
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
