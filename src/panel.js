import * as d3 from 'd3';
import './styles.css';

class AWSDashboardPanel {
  constructor(options) {
    this.width = options.width;
    this.height = options.height;
    this.data = options.data || this.getDefaultData(); // Datos por defecto si no hay fuente
    this.container = options.container;
    this.initVisualization();
  }

  // Datos por defecto (simulados)
  getDefaultData() {
    return {
      nodes: [
        { id: 'glue_extract', name: 'Extract Job', status: 'success', duration: 120 },
        { id: 'lambda_validate', name: 'Validate Data', status: 'success', duration: 45 },
        { id: 'glue_transform', name: 'Transform Job', status: 'running', duration: 180 },
        { id: 'athena_query', name: 'Athena Analysis', status: 'pending', duration: 0 }
      ],
      links: [
        { source: 'glue_extract', target: 'lambda_validate' },
        { source: 'lambda_validate', target: 'glue_transform' },
        { source: 'glue_transform', target: 'athena_query' }
      ]
    };
  }

  initVisualization() {
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.margin = { top: 20, right: 120, bottom: 20, left: 120 };
    this.graphWidth = this.width - this.margin.left - this.margin.right;
    this.graphHeight = this.height - this.margin.top - this.margin.bottom;

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.renderDAG();
  }

  renderDAG() {
    const hierarchy = d3.cluster()
      .size([this.graphHeight, this.graphWidth - 160]);

    const root = d3.stratify()
      .id(d => d.id)
      .parentId(d => {
        const link = this.data.links.find(l => l.target === d.id);
        return link ? link.source : null;
      })(this.data.nodes);

    hierarchy(root);

    const linkGenerator = d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x);

    this.g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-width', 2);

    const node = this.g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', 10)
      .attr('fill', d => {
        switch(d.data.status) {
          case 'success': return '#2ecc71';
          case 'running': return '#3498db';
          case 'pending': return '#95a5a6';
          default: return '#e74c3c';
        }
      });

    node.append('text')
      .attr('dy', '.31em')
      .attr('x', d => d.children ? -13 : 13)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => `${d.data.name} (${d.data.duration}s)`);
  }

  updateData(newData) {
    this.data = newData || this.getDefaultData();
    this.g.selectAll('*').remove();
    this.renderDAG();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.svg.attr('width', width).attr('height', height);
    this.graphWidth = width - this.margin.left - this.margin.right;
    this.graphHeight = height - this.margin.top - this.margin.bottom;
    this.updateData(this.data);
  }
}

export default AWSDashboardPanel;
