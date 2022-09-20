<template>
  <div class="data-viz"></div>
</template>
<script>
/* eslint-disable */ 
import * as d3 from "d3";
import { zoom } from "d3-zoom";
require("@/assets/data-viz.css");
export default {
  name: "DataViz",
  props: {
    msg: String
  },
  methods: {
    buildChordDiagram() {
      const url =
        "https://gist.githubusercontent.com/robinmackenzie/5c5d2af4e3db47d9150a2c4ba55b7bcd/raw/9f9c6b92d24bd9f9077b7fc6c4bfc5aebd2787d5/harvard_vis.json";
      const colornone = "#ccc";
      const colordark = "#222";
      const width = window.innerWidth / 2;
      const radius = width / 2;
      const zoom = d3.zoom();

      d3.json(url).then((json) => {
        // hack in the group name to each object
        json.forEach((o) => (o.group = o.name.split(".")[1]));
        // then render
        render(json);
      });

      function render(data) {
        const line = d3
          .lineRadial()
          .curve(d3.curveBundle.beta(0.85))
          .radius((d) => d.y)
          .angle((d) => d.x);

        const tree = d3.cluster().size([2 * Math.PI, radius - 100]);

        const root = tree(
          bilink(
            d3
              .hierarchy(hierarchy(data))
              .sort(
                (a, b) =>
                  d3.ascending(a.height, b.height) ||
                  d3.ascending(a.data.name, b.data.name)
              )
          )
        );

        const svg = d3
          .select(".data-viz")
          .append("svg")
          .attr("width", width)
          .attr("height", width)
          .append("g")
          .attr("transform", `translate(${radius},${radius})`);

        const arcInnerRadius = radius - 100;
        const arcWidth = 20;
        const arcOuterRadius = arcInnerRadius + arcWidth;
        const arc = d3
          .arc()
          .innerRadius(arcInnerRadius)
          .outerRadius(arcOuterRadius)
          .startAngle((d) => d.start)
          .endAngle((d) => d.end);

        const leafGroups = d3.groups(root.leaves(), (d) => d.parent.data.name);
        const arcAngles = leafGroups.map((g) => ({
          name: g[0],
          start: d3.min(g[1], (d) => d.x),
          end: d3.max(g[1], (d) => d.x)
        }));
        const colors = d3
          .scaleOrdinal()
          .domain(leafGroups.map((d) => d[0]))
          .range(d3.schemeTableau10);

        svg
          .selectAll(".arc")
          .data(arcAngles)
          .enter()
          .append("path")
          .attr("id", (d, i) => `arc_${i}`)
          .attr("d", (d) => arc({ start: d.start, end: d.end }))
          .attr("fill", (d) => colors(d.name));

        svg
          .selectAll(".arcLabel")
          .data(arcAngles)
          .enter()
          .append("text")
          .attr("x", 5)
          .attr("dy", (d) => (arcOuterRadius - arcInnerRadius) * 0.8)
          .append("textPath")
          .attr("class", "arcLabel")
          .attr("xlink:href", (d, i) => `#arc_${i}`)
          .text((d, i) =>
            d.end - d.start < (6 * Math.PI) / 180 ? "" : d.name
          );

        // add nodes
        const node = svg
          .append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .selectAll("g")
          .data(root.leaves())
          .join("g")
          .attr(
            "transform",
            (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y}, 0)`
          )
          .append("text")
          .attr("dy", "0.31em")
          .attr("x", (d) =>
            d.x < Math.PI ? arcWidth + 5 : (arcWidth + 5) * -1
          )
          .attr("text-anchor", (d) => (d.x < Math.PI ? "start" : "end"))
          .attr("transform", (d) => (d.x >= Math.PI ? "rotate(180)" : null))
          .text((d) => d.data.name)
          .style("fill", (d) => colors(d.data.group))
          .each(function (d) {
            d.text = this;
          })
          .on("mouseover", overed)
          .on("mouseout", outed)
          .call((text) =>
            text
              .append("title")
              .text(
                (d) =>
                  `${id(d)} ${d.outgoing.length} outgoing ${
                    d.incoming.length
                  } incoming`
              )
          );

        // add edges
        const link = svg
          .append("g")
          .attr("stroke", colornone)
          .attr("fill", "none")
          .selectAll("path")
          .data(root.leaves().flatMap((leaf) => leaf.outgoing))
          .join("path")
          //.style("mix-blend-mode", "multiply")
          .attr("d", ([i, o]) => line(i.path(o)))
          .each(function (d) {
            d.path = this;
          });

        function overed(event, d) {
          //link.style("mix-blend-mode", null);

          d3.select(this).style("fill", colordark).attr("font-weight", "bold");

          d3.selectAll(d.incoming.map((d) => d.path))
            .attr("stroke", (d) => colors(d[0].data.group))
            .attr("stroke-width", 4)
            .raise();

          d3.selectAll(d.outgoing.map((d) => d.path))
            .attr("stroke", (d) => colors(d[1].data.group))
            .attr("stroke-width", 4)
            .raise();

          d3.selectAll(d.incoming.map(([d]) => d.text))
            .style("fill", colordark)
            .attr("font-weight", "bold");

          d3.selectAll(d.outgoing.map(([, d]) => d.text))
            .style("fill", colordark)
            .attr("font-weight", "bold");
        }

        function outed(event, d) {
          //link.style("mix-blend-mode", "multiply");

          d3.select(this)
            .style("fill", (d) => colors(d.data.group))
            .attr("font-weight", null);

          d3.selectAll(d.incoming.map((d) => d.path))
            .attr("stroke", colornone)
            .attr("stroke-width", 1);

          d3.selectAll(d.outgoing.map((d) => d.path))
            .attr("stroke", colornone)
            .attr("stroke-width", 1);

          d3.selectAll(d.incoming.map(([d]) => d.text))
            .style("fill", (d) => colors(d.data.group))
            .attr("font-weight", null);

          d3.selectAll(d.outgoing.map(([, d]) => d.text))
            .style("fill", (d) => colors(d.data.group))
            .attr("font-weight", null);
        }

        function id(node) {
          return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
        }

        function bilink(root) {
          const map = new Map(root.leaves().map((d) => [id(d), d]));
          for (const d of root.leaves())
            (d.incoming = []),
              (d.outgoing = d.data.imports.map((i) => [d, map.get(i)]));
          for (const d of root.leaves())
            for (const o of d.outgoing) o[1].incoming.push(o);
          return root;
        }

        function hierarchy(data, delimiter = ".") {
          let root;
          const map = new Map();
          data.forEach(function find(data) {
            const { name } = data;
            if (map.has(name)) return map.get(name);
            const i = name.lastIndexOf(delimiter);
            map.set(name, data);
            if (i >= 0) {
              find({ name: name.substring(0, i), children: [] }).children.push(
                data
              );
              data.name = name.substring(i + 1);
            } else {
              root = data;
            }
            return data;
          });
          return root;
        }
        // https://github.com/d3/d3-zoom/blob/v3.0.0/README.md#zoom
        //selection.call(d3.zoom().on("zoom", zoomed));

      }
    }
  },
  mounted() {
    this.buildChordDiagram();
  }
};
</script>
